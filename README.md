# Softsquare26 FE — Food Ordering System

Frontend นี้ปรับให้ยึด Backend จากโปรเจ็กต์ `Softsquare26_BE` เป็นหลัก โดยเรียก API ที่ `http://localhost:5124/api`

## Flow ที่ทำไว้

- Login / Register ด้วย `Users/login` และ `Users/register`
- Customer
  - ดูเมนูจาก `Products`
  - ค้นหา / กรองหมวดหมู่
  - เพิ่มหลายเมนูลงตะกร้า
  - สั่งอาหารผ่าน `Orders`
  - ดูประวัติออเดอร์ของตัวเองผ่าน `Orders/customer/{customerId}`
  - ยกเลิกออเดอร์ที่ยัง Pending ได้
- Admin
  - ดู Dashboard จาก `Dashboard/summary`
  - ดู/ค้นหา/กรองออเดอร์ทั้งหมด
  - เปลี่ยนสถานะ Pending / Completed / Cancelled
  - แก้ไขหรือลบออเดอร์
  - เพิ่ม/แก้ไข/ลบเมนู
  - เพิ่ม/แก้ไข/ลบหมวดหมู่

## วิธีรัน

เปิด Backend ก่อน:

```bash
cd Softsquare26_BE-main
dotnet run
```

จากนั้นเปิด Frontend:

```bash
cd Softsquare26_FE-main
npm install
npm start
```

เปิดเว็บที่:

```bash
http://localhost:4200
```

## Admin demo

```txt
email: admin@example.com
password: admin123
```

## Build check

โปรเจ็กต์นี้ build ผ่านแล้วด้วยคำสั่ง:

```bash
npm run build
```
