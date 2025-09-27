# 개발자 채팅앱 API 가이드

## 개요

개발자를 위한 채팅앱에서 코드 블록과 파일 첨부 기능을 구현하기 위한 API 가이드입니다.

## 1. 메시지 데이터 구조 확장

### 기존 Message 타입 확장

```typescript
interface Message {
  id: string;
  content: string;
  sender: {
    id: string;
    username: string;
  };
  createdAt: string;
  privateChat?: {
    id: string;
  };

  // 새로 추가될 필드들
  codeAttachments?: CodeAttachment[];
  fileAttachments?: FileAttachment[];
}

interface CodeAttachment {
  id: string;
  code: string;
  language: string; // javascript, python, java, etc.
  filename?: string; // 선택사항
  createdAt: string;
}

interface FileAttachment {
  id: string;
  name: string;
  size: number;
  type: string; // MIME type
  url: string; // 서버에 저장된 파일 URL
  content?: string; // 텍스트 파일의 경우 내용
  createdAt: string;
}
```

## 2. Socket.IO 이벤트 확장

### 메시지 전송 이벤트 수정

```typescript
// 클라이언트에서 서버로 전송
socket.emit("sendMessage", {
  chatId: string;
  content: string;
  userId: string;
  username: string;
  chatType: string;

  // 새로 추가될 필드들
  codeAttachments?: CodeAttachment[];
  fileAttachments?: FileAttachment[];
});

// 서버에서 클라이언트로 전송
socket.emit("newMessage", Message);
```

## 3. 파일 업로드 API

### 파일 업로드 엔드포인트

```typescript
// POST /api/upload
// Content-Type: multipart/form-data

interface UploadResponse {
  success: boolean;
  files: {
    id: string;
    name: string;
    size: number;
    type: string;
    url: string;
    content?: string; // 텍스트 파일의 경우
  }[];
}

// 요청 예시
const formData = new FormData();
formData.append("files", file);
formData.append("chatId", chatId);

const response = await fetch("/api/upload", {
  method: "POST",
  body: formData,
  headers: {
    Authorization: `Bearer ${token}`,
  },
});
```

## 4. 데이터베이스 스키마

### 메시지 테이블 확장

```sql
-- 메시지 테이블에 첨부 파일 정보 추가
ALTER TABLE messages ADD COLUMN code_attachments JSON;
ALTER TABLE messages ADD COLUMN file_attachments JSON;

-- 또는 별도 테이블로 분리 (권장)
CREATE TABLE code_attachments (
  id VARCHAR(255) PRIMARY KEY,
  message_id VARCHAR(255) NOT NULL,
  code TEXT NOT NULL,
  language VARCHAR(50) NOT NULL,
  filename VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (message_id) REFERENCES messages(id) ON DELETE CASCADE
);

CREATE TABLE file_attachments (
  id VARCHAR(255) PRIMARY KEY,
  message_id VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  size BIGINT NOT NULL,
  type VARCHAR(100) NOT NULL,
  url VARCHAR(500) NOT NULL,
  content TEXT, -- 텍스트 파일의 경우
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (message_id) REFERENCES messages(id) ON DELETE CASCADE
);
```

## 5. 서버 구현 가이드

### Node.js/Express 예시

```javascript
// 파일 업로드 미들웨어 설정
const multer = require("multer");
const path = require("path");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB 제한
  fileFilter: (req, file, cb) => {
    // 허용되는 파일 타입 체크
    const allowedTypes = [
      "text/plain",
      "text/javascript",
      "text/typescript",
      "application/json",
      "text/markdown",
      "text/html",
      "image/png",
      "image/jpeg",
      "image/gif",
    ];

    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("허용되지 않는 파일 타입입니다."));
    }
  },
});

// 파일 업로드 라우트
app.post("/api/upload", upload.array("files", 10), async (req, res) => {
  try {
    const files = req.files.map((file) => {
      const fileData = {
        id: generateId(),
        name: file.originalname,
        size: file.size,
        type: file.mimetype,
        url: `/uploads/${file.filename}`,
      };

      // 텍스트 파일인 경우 내용 읽기
      if (file.mimetype.startsWith("text/")) {
        fileData.content = fs.readFileSync(file.path, "utf8");
      }

      return fileData;
    });

    res.json({ success: true, files });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 메시지 저장 시 첨부 파일 정보도 함께 저장
app.post("/api/messages", async (req, res) => {
  const { content, chatId, userId, codeAttachments, fileAttachments } =
    req.body;

  const message = await Message.create({
    content,
    chatId,
    userId,
    // 첨부 파일 정보 저장
    codeAttachments: codeAttachments || [],
    fileAttachments: fileAttachments || [],
  });

  // Socket.IO로 실시간 전송
  io.to(chatId).emit("newMessage", message);

  res.json({ success: true, message });
});
```

## 6. 클라이언트 구현 가이드

### 파일 업로드 함수

```typescript
// src/lib/api/fileUpload.ts
export const uploadFiles = async (
  files: File[],
  chatId: string
): Promise<FileAttachment[]> => {
  const formData = new FormData();

  files.forEach((file) => {
    formData.append("files", file);
  });
  formData.append("chatId", chatId);

  const response = await axiosInstance.post("/upload", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return response.data.files;
};
```

### 메시지 전송 함수 수정

```typescript
// src/lib/api/message.ts
export const sendMessage = async (messageData: {
  chatId: string;
  content: string;
  userId: string;
  username: string;
  chatType: string;
  codeAttachments?: CodeAttachment[];
  fileAttachments?: FileAttachment[];
}) => {
  // 파일이 있는 경우 먼저 업로드
  let uploadedFiles: FileAttachment[] = [];
  if (messageData.fileAttachments) {
    // TODO: 실제 파일 업로드 로직 구현
    uploadedFiles = await uploadFiles(
      messageData.fileAttachments,
      messageData.chatId
    );
  }

  // Socket.IO로 메시지 전송
  socket.emit("sendMessage", {
    ...messageData,
    fileAttachments: uploadedFiles,
  });
};
```

## 7. 보안 고려사항

### 파일 업로드 보안

```typescript
// 파일 타입 검증
const ALLOWED_EXTENSIONS = [
  ".txt",
  ".js",
  ".ts",
  ".jsx",
  ".tsx",
  ".py",
  ".java",
  ".cpp",
  ".c",
  ".css",
  ".html",
  ".json",
  ".md",
  ".xml",
  ".yaml",
  ".yml",
  ".sql",
  ".png",
  ".jpg",
  ".jpeg",
  ".gif",
];

const ALLOWED_MIME_TYPES = [
  "text/plain",
  "text/javascript",
  "text/typescript",
  "application/json",
  "text/markdown",
  "text/html",
  "image/png",
  "image/jpeg",
  "image/gif",
];

// 파일 크기 제한
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

// 코드 크기 제한
const MAX_CODE_SIZE = 100 * 1024; // 100KB
```

## 8. 성능 최적화

### 이미지 최적화

```typescript
// 이미지 리사이징 및 압축
const optimizeImage = async (file: File): Promise<File> => {
  return new Promise((resolve) => {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new Image();

    img.onload = () => {
      // 최대 크기로 리사이징
      const maxWidth = 800;
      const maxHeight = 600;

      let { width, height } = img;
      if (width > maxWidth || height > maxHeight) {
        const ratio = Math.min(maxWidth / width, maxHeight / height);
        width *= ratio;
        height *= ratio;
      }

      canvas.width = width;
      canvas.height = height;
      ctx?.drawImage(img, 0, 0, width, height);

      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(new File([blob], file.name, { type: "image/jpeg" }));
          }
        },
        "image/jpeg",
        0.8
      );
    };

    img.src = URL.createObjectURL(file);
  });
};
```

## 9. 구현 체크리스트

### 프론트엔드

- [ ] CodeBlock 컴포넌트 구현
- [ ] FileAttachment 컴포넌트 구현
- [ ] MessageInput에 첨부 기능 추가
- [ ] 파일 업로드 API 연동
- [ ] 코드 하이라이팅 라이브러리 추가 (선택사항)

### 백엔드

- [ ] 메시지 데이터 구조 확장
- [ ] 파일 업로드 API 구현
- [ ] 파일 저장소 설정 (로컬/S3 등)
- [ ] 데이터베이스 스키마 업데이트
- [ ] Socket.IO 이벤트 확장
- [ ] 파일 타입/크기 검증
- [ ] 보안 설정

### 추가 기능 (선택사항)

- [ ] 코드 하이라이팅 (Prism.js, Highlight.js)
- [ ] 파일 미리보기 기능
- [ ] 파일 검색 기능
- [ ] 코드 실행 기능 (Sandbox)
- [ ] 협업 편집 기능

## 10. 라이브러리 추천

### 코드 하이라이팅

```bash
npm install prismjs @types/prismjs
# 또는
npm install highlight.js @types/highlight.js
```

### 파일 업로드

```bash
npm install multer @types/multer
```

### 이미지 처리

```bash
npm install sharp
```

이 가이드를 따라 구현하면 개발자 친화적인 채팅앱의 코드/파일 첨부 기능을 완성할 수 있습니다.
