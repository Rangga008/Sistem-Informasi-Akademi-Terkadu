# Follow dan Like Feature dengan Email Notification

Fitur follow dan like telah berhasil dibuat dengan notifikasi email otomatis.

## Database Schema

Telah ditambahkan 2 model baru di Prisma:

- **Follow**: Untuk follow/unfollow user
- **ProjectLike**: Untuk like/unlike project

## API Endpoints

### Follow Endpoints

- `POST /follow/:userId` - Follow user
- `DELETE /follow/:userId` - Unfollow user
- `GET /follow/followers/:userId` - Dapatkan daftar followers
- `GET /follow/following/:userId` - Dapatkan daftar yang diikuti
- `GET /follow/is-following/:userId` - Cek status follow
- `GET /follow/stats/:userId` - Dapatkan statistik followers & following

### Like Endpoints

- `POST /project-likes/:projectId` - Like project
- `DELETE /project-likes/:projectId` - Unlike project
- `GET /project-likes/project/:projectId` - Dapatkan daftar yang like project
- `GET /project-likes/user/:userId` - Dapatkan project yang dilike user
- `GET /project-likes/is-liked/:projectId` - Cek status like
- `GET /project-likes/count/:projectId` - Dapatkan jumlah like

## Email Notifications

### 1. Notifikasi Project Baru

Ketika user upload project baru, **semua follower akan menerima email** berisi:

- Nama uploader
- Judul project
- Deskripsi project
- Link ke project

### 2. Notifikasi Like

Ketika seseorang like project, **owner project akan menerima email** berisi:

- Nama orang yang like
- Judul project
- Link ke project

## Setup Required

### 1. Install Dependencies

\`\`\`bash
cd api
npm install nodemailer @types/nodemailer
\`\`\`

### 2. Run Migration

\`\`\`bash
npx prisma migrate dev --name add_follow_and_likes
npx prisma generate
\`\`\`

### 3. Configure Environment Variables

Tambahkan ke file `.env`:
\`\`\`env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM=noreply@akademi.com
FRONTEND_URL=http://localhost:3000
\`\`\`

### 4. Setup Gmail App Password (jika pakai Gmail)

1. Go to Google Account Settings
2. Security → 2-Step Verification
3. App passwords → Create new app password
4. Copy password dan gunakan sebagai `SMTP_PASS`

## Struktur File Baru

\`\`\`
api/src/
├── follow/
│ ├── follow.module.ts
│ ├── follow.service.ts
│ └── follow.controller.ts
├── project-likes/
│ ├── project-likes.module.ts
│ ├── project-likes.service.ts
│ └── project-likes.controller.ts
└── mail/
├── mail.module.ts
└── mail.service.ts
\`\`\`

## Cara Kerja

1. **User A** follow **User B**
2. **User B** upload project baru
3. Sistem otomatis kirim email ke **User A** (dan semua followers lainnya)
4. **User A** klik link di email, melihat project
5. **User A** like project
6. **User B** (owner) menerima email notifikasi like

## Testing

Gunakan Postman atau Thunder Client untuk test API:

1. **Follow user**:

   - POST `http://localhost:4000/follow/{userId}`
   - Headers: `Authorization: Bearer {token}`

2. **Like project**:

   - POST `http://localhost:4000/project-likes/{projectId}`
   - Headers: `Authorization: Bearer {token}`

3. **Upload project baru**:
   - POST `http://localhost:4000/projects/user/{userId}`
   - Email otomatis terkirim ke followers
