# 📱 FamilyOS - Workflow & Use Cases

คู่มือการใช้งานและ User Flow ทั้งหมดของ FamilyOS (Family Wealth & Lifestyle Manager)

---

## 🎯 ภาพรวมของแอป

**FamMee** เป็นแอปจัดการทรัพยากรครอบครัวแบบครบวงจร ที่รวมการจัดการเงิน (Wealth), การวางแผนกิจกรรม (Events/Tasks), และระบบให้รางวัล (Gamification) เข้าด้วยกัน

---

## 1️⃣ Use Case: เข้าสู่ระบบและเลือก Profile

### เป้าหมาย

สมาชิกในครอบครัวสามารถเลือก Profile ของตัวเองเพื่อเข้าใช้งานแอป โดยแต่ละคนจะเห็นข้อมูลที่เหมาะสมกับบทบาท (Parent/Child)

### User Flow

#### ขั้นตอนที่ 1: หน้าเลือก Profile

```
เปิดแอป → หน้า "Time+Money = Happy"
```

**UI ที่เห็น:**

- หัวข้อ "Time+Money = Happy" ตรงกลาง
- รูป Avatar ของสมาชิกทุกคนในครอบครัว (Dad, Mom, Junior, Nana)
- ปุ่ม "+" สำหรับเพิ่ม Profile ใหม่
- ปุ่ม "Manage Profiles" ด้านล่าง

**การโต้ตอบ:**

- **Hover Avatar**: รูปจะขยายและมีขอบสีฟ้าพาสเทล + แสดง Tooltip "Login as [ชื่อ]"
- **กด Avatar ที่ไม่มีกุญแจ** (เช่น Junior): เข้าสู่ระบบทันที → Dashboard
- **กด Avatar ที่มีกุญแจ** (เช่น Dad, Mom): เด้ง Dialog ถาม PIN

#### ขั้นตอนที่ 2: ใส่ PIN (สำหรับ Profile ที่มี PIN)

**UI ที่เห็น:**

- Dialog แสดงชื่อ Profile ("Enter PIN for Dad")
- ช่องกรอก PIN (4 หลัก)
- ปุ่ม "Access Profile"

**การโต้ตอบ:**

- พิมพ์ PIN (1111 สำหรับ Dad, 2222 สำหรับ Mom ใน Mock)
- กด Enter หรือคลิก "Access Profile"
- ✅ **ถูกต้อง**: เข้า Dashboard
- ❌ **ผิด**: แสดงข้อความ "Incorrect PIN" สีแดง, ช่อง PIN ล้างค่า

### Expected Outcome

- ระบบจำ Profile ที่เลือก
- เข้าสู่หน้า Dashboard พร้อมข้อมูลของ Profile นั้น

---

## 2️⃣ Use Case: ดูภาพรวมทางการเงิน (Dashboard)

### เป้าหมาย

ผู้ใช้สามารถดูสถานะทางการเงินโดยรวม และ Transaction ล่าสุดได้ในหน้าเดียว

### User Flow

#### หน้า Dashboard

**ส่วนบน (Header):**

- Avatar และชื่อผู้ใช้ปัจจุบัน (เช่น "Welcome, Dad")
- ชื่อครอบครัว ("My Family")
- ไอคอน Settings (ขวาบน)

**ส่วนกลาง (Main Content):**

**1. Net Worth Card (การ์ดสีฟ้าพาสเทล Gradient)**

```
Total Net Worth: ฿245,680
├─ Assets: ฿320,500
└─ Liabilities: ฿74,820
```

- แสดงความมั่งคั่งสุทธิ (Assets - Liabilities)
- ตัวเลขใหญ่โดดเด่น
- แยกแสดงสินทรัพย์และหนี้สินด้านล่าง

**2. Quick Actions (4 ปุ่มรวดเร็ว)**

```
[Income]  [Expense]  [Transfer]  [Task]
 สีเขียว    สีแดง      สีน้ำเงิน    สีม่วง
```

- Hover แต่ละปุ่ม → แสดง Tooltip "Add new [ประเภท]"
- กด → เปิดฟอร์มบันทึกรายการ (จะทำในระยะต่อไป)

**3. Recent Activity (รายการล่าสุด)**

- แสดง Transaction 4 รายการล่าสุด
- แต่ละรายการมี:
  - ไอคอนวงกลมสี (ตัวอักษรแรก)
  - ชื่อรายการ (Grocery Shopping, Salary Deposit, etc.)
  - หมวดหมู่ + เวลา (Food & Dining • 2h ago)
  - ยอดเงิน (สีแดง = ลบ, สีเขียว = บวก)
- กด Card → ดูรายละเอียดเต็ม (ยังไม่ได้ทำ)

**ส่วนล่าง:**

- **Bottom Tab Navigation**: Home (Active), Wallet, Tasks, Calendar, More
- **FAB (Floating Action Button)**: ปุ่มกลม + สีฟ้า ด้านขวาล่าง (Quick Add)

### การโต้ตอบ

- **Scroll ลง**: ดู Activity เพ่ิมเติม
- **กดแท็บด้านล่าง**: เปลี่ยนหน้า
- **กด FAB**: เปิด Quick Add Menu (ยังไม่ได้ทำ)

### Expected Outcome

- เห็นสถานะการเงินรวมได้ทันที
- เข้าถึง Quick Actions ได้อย่างรวดเร็ว

---

## 3️⃣ Use Case: จัดการบัญชีและกระเป๋าเงิน (Wallet)

### เป้าหมาย

ดูรายละเอียดบัญชีทั้งหมด (Cash, Bank, Credit Card, Investment) และบันทึก Transaction

### User Flow

#### หน้า Wallet

**ส่วนบน (Header):**

- หัวข้อ "Wallet" + คำอธิบาย "Manage your accounts"
- ปุ่ม + (เพิ่มบัญชีใหม่)

**ส่วนกลาง:**

**1. Net Worth Summary Card (Gradient สีฟ้า)**

```
Net Worth: ฿311,180
├─ Assets ↗: ฿320,680
└─ Liabilities ↙: ฿8,500
```

**2. รายการบัญชีทั้งหมด**

แต่ละ Account Card แสดง:

- ไอคอน Emoji (💵, 🏦, 💳, 📈)
- ชื่อบัญชี (Cash Wallet, Savings Account, etc.)
- ประเภท (CASH, BANK, CREDIT, INVESTMENT)
- ยอดเงิน
  - สีปกติ = บวก (สินทรัพย์)
  - สีแดง = ลบ (หนี้สิน)
- **Investment Account** มีแสดง % กำไร (+12.5% TrendingUp)

**ตัวอย่าง:**

```
💵  Cash Wallet          ฿3,250
    CASH

🏦  Savings Account      ฿125,000
    BANK

💳  Credit Card          -฿8,500
    CREDIT               (สีแดง)

📈  Stock Portfolio      ฿192,430
    INVESTMENT           +12.5% ↗
```

**3. Quick Actions (2 ปุ่ม)**

```
[↙ Add Income]     [↗ Add Expense]
  สีเขียว             สีแดง
```

### การโต้ตอบ

- **กด Account Card**: ดูรายการ Transaction ของบัญชีนั้น (ยังไม่ได้ทำ)
- **กด Add Income/Expense**: บันทึกรายการใหม่
- **กด + Header**: เพิ่มบัญชีใหม่

### Expected Outcome

- เห็นภาพรวมบัญชีทั้งหมดในที่เดียว
- ติดตามยอดหนี้/สินทรัพย์ได้ง่าย

---

## 4️⃣ Use Case: จัดการงานบ้านและให้รางวัล (Tasks)

### เป้าหมาย

**สำหรับ Parent**: มอบหมายงาน, อนุมัติงาน, จ่าย Family Points  
**สำหรับ Child**: รับงาน, ส่งงาน, รับ Points

### User Flow

#### หน้า Tasks

**ส่วนบน:**

- หัวข้อ "Tasks" + "Family missions & rewards"

**1. Family Points Summary (Gradient สีม่วง)**

```
⭐ Family Points: 70 FP
Pending approval: 30 FP
```

- แสดงคะแนนที่ได้รับแล้ว (Approved)
- แสดงคะแนนที่รอตรวจ (Submitted)

**2. Task Filters**

```
[All]  [Pending]  [Submitted]  [Approved]
```

- กดเพื่อกรอง Task ตามสถานะ

**3. รายการ Task**

แต่ละ Task Card แสดง:

**ตัวอย่าง Task 1 (PENDING - รอทำ):**

```
🕐 Clean your room                    ⭐ 50
   Make your bed, organize toys...
   By: Dad  •  Due: 05/02/2026

   [Mark Complete] ← ปุ่มสีฟ้า
```

**ตัวอย่าง Task 2 (SUBMITTED - รอตรวจ):**

```
📷 Do homework                         ⭐ 30
   Math homework pages 20-22
   By: Mom  •  Due: 04/02/2026

   [Approve] [Reject] ← สีเขียว/แดง
```

**ตัวอย่าง Task 3 (APPROVED - เสร็จแล้ว):**

```
✓ Water the plants                    ⭐ 20
   All plants in the garden
   By: Dad  •  Due: 03/02/2026

   [✓ Completed] ← Badge สีเขียว
```

**ตัวอย่าง Task 4 (REJECTED - ต้องทำใหม่):**

```
✗ Wash the dishes                     ⭐ 15
   Clean all dishes after dinner
   By: Mom  •  Due: 02/02/2026

   [✗ Rejected] ← Badge สีแดง
```

### Workflow แต่ละบทบาท

#### A. Child (Junior) - รับงานและส่งงาน

```
1. เห็น Task "PENDING" (เช่น Clean your room)
2. ทำงานจริง
3. กด [Mark Complete]
4. อัพโหลดรูป (Optional)
5. สถานะเปลี่ยนเป็น "SUBMITTED"
6. รอ Parent ตรวจ
```

#### B. Parent (Dad/Mom) - ตรวจงานและจ่าย Points

```
1. เห็น Task "SUBMITTED" (ลูกส่งมาแล้ว)
2. ตรวจสอบงาน (ดูรูป/คำอธิบาย)
3. ตัดสินใจ:

   ถ้าพอใจ:
   → กด [Approve]
   → Points โอนเข้ากระเป๋าลูกอัตโนมัติ
   → สถานะเปลี่ยนเป็น "APPROVED"

   ถ้าไม่พอใจ:
   → กด [Reject]
   → สถานะกลับเป็น "PENDING"
   → ลูกต้องทำใหม่
```

### การโต้ตอบ

- **กด Filter**: กรอง Task ตามสถานะ
- **Swipe Card**: แสดงตัวเลือกเพิ่มเติม (Delete, Edit) - ยังไม่ได้ทำ
- **กดปุ่ม Action**: ดำเนินการตามสถานะ

### Expected Outcome

- Parent ควบคุมการให้รางวัลได้
- Child มีแรงจูงใจทำงานบ้าน
- ระบบ Points โปร่งใส

---

## 5️⃣ Use Case: ดูปฏิทินและวางแผนล่วงหน้า (Calendar)

### เป้าหมาย

เห็นภาพรวม Events, Transactions, Tasks ที่วางแผนไว้ในอนาคต

### User Flow

#### หน้า Calendar

**ส่วนบน:**

- หัวข้อ "Calendar" + "Events & Transactions"
- ไอคอนปฏิทิน

**1. Month Header**

```
February 2026
6 upcoming events
```

**2. Event Timeline (แบ่งตามวัน)**

แต่ละวันแสดง:

- **Date Badge**: วันที่ + วัน (เช่น "Wed 5")
- **Event Cards** จัดเรียงตามเวลา

**ตัวอย่าง Timeline:**

#### **พุธที่ 5 ก.พ.**

```
💵 Grocery Shopping              -฿1,500
   10:00  •  Shopping

💰 Salary Payment                +฿45,000
   09:00  •  Income
```

#### **พฤหัสที่ 6 ก.พ.**

```
🎉 Family Dinner
   18:30  •  Family  •  Home
```

#### **ศุกร์ที่ 7 ก.พ.**

```
📝 Junior: Clean Room            ⭐ 50 FP
   16:00  •  Chores
```

#### **เสาร์ที่ 8 ก.พ.**

```
💡 Electricity Bill              -฿850
   All day  •  Utilities
```

#### **จันทร์ที่ 10 ก.พ.**

```
✈️ Weekend Trip                  Budget: ฿5,000
   08:00  •  Travel
```

**3. Legend (คำอธิบายสี)**

```
🟢 Income     🔴 Expense
🔵 Task       🟣 Event
```

### Event Types

**1. INCOME (สีเขียว 💰)**

- รายรับที่คาดว่าจะได้
- แสดง: +฿ยอดเงิน

**2. EXPENSE (สีแดง/ส้ม 💵)**

- รายจ่ายที่วางแผนไว้
- แสดง: -฿ยอดเงิน

**3. TASK (สีน้ำเงิน 📝)**

- งานที่มอบหมายให้ลูก
- แสดง: ⭐ Points

**4. EVENT (สีม่วง/ชมพู 🎉)**

- กิจกรรมครอบครัว
- แสดง: สถานที่/งบประมาณ

### การโต้ตอบ

- **Scroll ดูเดือนอื่น**: เลื่อนขึ้น-ลง
- **กด Event Card**: ดูรายละเอียด/แก้ไข (ยังไม่ได้ทำ)
- **Hover Event**: แสดง Tooltip ประเภท Event

### Expected Outcome

- วางแผนการเงินล่วงหน้าได้
- เห็น Deadline ของงานต่างๆ
- ครอบครัวรู้กำหนดการร่วมกัน

---

## 6️⃣ Use Case: การแชร์บัญชีและอีเวนต์ (Shared Accounts & Events)

### เป้าหมาย

เข้าใจว่า**การแชร์ไม่ใช่แค่ดูอย่างเดียว** แต่หมายถึง **สิทธิ์ในการสร้างและแก้ไข Transaction** พร้อมระบบบันทึก Edit Log

### สถานการณ์ที่ 1: Parent แชร์บัญชี Joint Savings ให้ Partner

#### ก่อนแชร์

```
Dad เป็นเจ้าของบัญชี "Joint Savings" (฿125,000)
Mom ไม่เห็นบัญชีนี้เลย
```

#### หลังแชร์ (Dad กด Share → เลือก Mom)

```
✅ Mom สามารถ:
   - เห็นยอดเงินในบัญชี
   - บันทึกรายจ่ายจากบัญชีนี้ (เช่น ค่าตลาด ฿1,500)
   - บันทึกรายรับเข้าบัญชี
   - แก้ไข Transaction ที่ Dad สร้าง (ถ้าพบว่าจำนวนเงินผิด)
   - ดูประวัติการแก้ไข (Edit History)
```

#### Workflow: Mom บันทึกค่าใช้จ่าย

```
1. Mom เปิดหน้า Wallet
2. เห็นบัญชี "Joint Savings" (มีไอคอน 👥 ข้างชื่อ)
3. กด [Add Expense]
4. กรอกข้อมูล:
   - จำนวน: ฿1,500
   - หมวดหมู่: Groceries
   - บัญชีต้นทาง: Joint Savings
   - หมายเหตุ: ไปตลาดสด
5. กด Save
6. → Transaction ถูกสร้าง โดยแสดง "Created by Mom" (Avatar ขนาดเล็ก)
```

#### Workflow: Dad แก้ไข Transaction ที่ Mom สร้าง

```
1. Dad เปิดหน้า Wallet → Joint Savings
2. เห็น Transaction "ไปตลาดสด -฿1,500" (Created by Mom)
3. พบว่ายอดเงินผิด (จริงๆ ฿1,350)
4. กด Transaction → Edit
5. แก้ไขยอดเงินจาก ฿1,500 เป็น ฿1,350
6. ใส่เหตุผล: "ตรวจสอบใบเสร็จแล้ว"
7. กด Save
8. → ระบบบันทึก Edit Log:
   {
     "edited_by": "Dad",
     "edited_at": "2026-02-05 20:45",
     "changes": {
       "amount": { "old": 1500, "new": 1350 }
     },
     "reason": "ตรวจสอบใบเสร็จแล้ว"
   }
```

#### Workflow: Mom ดูประวัติการแก้ไข

```
1. Mom เปิด Transaction "ไปตลาดสด"
2. เห็นแบดจ์ "✏️ 1 edit" ข้างยอดเงิน
3. กดแท็บ "History"
4. เห็นข้อความ:
   "Dad แก้ไขยอดเงินจาก ฿1,500 เป็น ฿1,350 • 5 นาทีที่แล้ว
    เหตุผล: ตรวจสอบใบเสร็จแล้ว"
```

---

### สถานการณ์ที่ 2: Parent แชร์ Event "Family Trip" ให้ทั้งสองคน

#### Workflow: สร้าง Event และแชร์

```
1. Dad สร้าง Event "Family Trip Chiang Mai"
   - วันที่: 10-12 ก.พ. 2026
   - งบประมาณ: ฿10,000
2. กด "Share Event" → เลือก Mom
3. → Mom เห็น Event ในปฏิทินของตัวเอง
```

#### Workflow: ทั้งคู่บันทึกค่าใช้จ่ายระหว่างทริป

**วันที่ 10 ก.พ. (Dad บันทึก):**

```
Dad กด Quick Add → Expense
- จำนวน: ฿2,500
- หมวดหมู่: Accommodation
- Event: Family Trip Chiang Mai (เลือกจาก Dropdown)
- บัญชี: Credit Card
→ Transaction ถูก Tag เข้ากับ Event
```

**วันที่ 11 ก.พ. (Mom บันทึก):**

```
Mom กด Quick Add → Expense
- จำนวน: ฿800
- หมวดหมู่: Food & Dining
- Event: Family Trip Chiang Mai
- บัญชี: Cash Wallet
→ Transaction ถูก Tag เข้ากับ Event
```

#### Workflow: ดูสรุปค่าใช้จ่าย Event

```
1. Dad เปิด Event "Family Trip Chiang Mai"
2. กดแท็บ "Expenses"
3. เห็นรายการ:

   ฿2,500  Accommodation  (Created by Dad 👨)
   ฿800    Food & Dining  (Created by Mom 👩)
   ฿350    Fuel           (Created by Dad 👨)
   ฿1,200  Shopping       (Created by Mom 👩)
   ────────────────────────────────────
   Total:  ฿4,850 / ฿10,000
   เหลืองบ: ฿5,150 ✅
```

---

### สถานการณ์ที่ 3: ตรวจสอบ Audit Trail

#### ทำไมต้องมี Edit Log?

> [!IMPORTANT]
> เมื่อหลายคนแก้ไขข้อมูลเดียวกัน จำเป็นต้องรู้ว่า:
>
> - ใครแก้อะไร
> - เมื่อไหร่
> - ทำไมถึงแก้

**ตัวอย่างกรณีใช้งาน:**

```
Transaction: "ค่าไฟฟ้าประจำเดือน"

ประวัติการแก้ไข:
────────────────────────────────────
[1] Dad สร้างรายการ
    ฿850 • 2026-02-01 10:00

[2] Mom แก้ไขยอดเงิน
    ฿850 → ฿920 • 2026-02-03 14:30
    เหตุผล: "ตรวจสอบใบแจ้งหนี้อีกครั้ง"

[3] Dad แก้ไขหมวดหมู่
    Bills → Utilities • 2026-02-03 15:00
    เหตุผล: "จัดหมวดหมู่ใหม่"
────────────────────────────────────
```

---

### UI Elements สำหรับ Shared Resources

#### 1. Shared Account Card

```
┌────────────────────────────────┐
│ 💰 Joint Savings    👥 Shared  │ ← ไอคอนแสดงว่าถูกแชร์
│ BANK                           │
│                                │
│ ฿125,000                       │
│                                │
│ Shared with: Mom               │ ← รายชื่อผู้มีสิทธิ์
└────────────────────────────────┘
```

#### 2. Transaction with Edit Badge

```
┌────────────────────────────────┐
│ 💵 Grocery Shopping            │
│ Food & Dining • 2h ago         │
│                                │
│ -฿1,350  ✏️ 1 edit            │ ← แบดจ์แก้ไข
│                                │
│ Created by: Mom 👩             │ ← แสดงผู้สร้าง
│ Last edited: Dad 👨            │ ← แสดงผู้แก้ไขล่าสุด
└────────────────────────────────┘
```

#### 3. Edit History Timeline

```
┌────────────────────────────────┐
│ 📝 Edit History                │
│                                │
│ Dad • 5 minutes ago            │
│ ยอดเงิน: ฿1,500 → ฿1,350      │
│ เหตุผล: "ตรวจสอบใบเสร็จแล้ว"  │
│                                │
│ Mom • 2 hours ago              │
│ สร้างรายการ                    │
│ ยอดเงิน: ฿1,500                │
└────────────────────────────────┘
```

---

### Expected Outcome

- ✅ สมาชิกที่ได้รับสิทธิ์สามารถบันทึกและแก้ไขได้เหมือนเจ้าของ
- ✅ ระบบบันทึกประวัติทุกการแก้ไข (Transparency)
- ✅ ลดความซ้ำซ้อน (ไม่ต้องขออนุมัติทุกครั้ง)
- ✅ เหมาะกับคู่สามีภรรยาที่บริหารเงินร่วมกัน

---

## 7️⃣ Use Case: เพิ่มรายการใหม่ (Quick Add)

### เป้าหมาย

บันทึก Transaction/Task/Event อย่างรวดเร็ว

### Entry Points (จุดเข้าใช้งาน)

**1. จาก Dashboard** → กด Quick Action Buttons:

- [Income] → เปิดฟอร์มบันทึกรายรับ
- [Expense] → เปิดฟอร์มบันทึกรายจ่าย
- [Transfer] → เปิดฟอร์มโอนเงินระหว่างบัญชี
- [Task] → เปิดฟอร์มมอบหมายงาน

**2. จาก Wallet** → กด [Add Income] หรือ [Add Expense]

**3. จากทุกหน้า** → กด FAB (Floating Action Button) ขวาล่าง
→ แสดงเมนูเลือก (Income/Expense/Transfer/Task/Event)

### Expected Workflow (ยังไม่ได้ทำ - แนวคิด)

```
1. กดปุ่ม Quick Add
2. เลือกประเภท (Income/Expense/etc.)
3. กรอกข้อมูล:
   - จำนวนเงิน
   - หมวดหมู่
   - บัญชีต้นทาง/ปลายทาง
   - วันที่
   - หมายเหตุ
4. กด Save
5. → กลับหน้าเดิม + แสดงรายการใหม่
```

---

## 7️⃣ Navigation Pattern (แนวทางการเดินทาง)

### Bottom Tab Navigation

```
[Home]  [Wallet]  [Tasks]  [Calendar]  [More]
  🏠      💰        ✓         📅         ☰
```

**Active State:**

- ไอคอนหนาขึ้น (strokeWidth 2.5)
- สีเปลี่ยนเป็น Primary (ฟ้าพาสเทล)
- Label ชัดเจน

**Inactive State:**

- ไอคอนบางลง (strokeWidth 2)
- สีเทาอ่อน (muted)

### การเปลี่ยนหน้า

```
Profile Selection → Dashboard (เข้าครั้งแรก)
Dashboard ↔ Wallet ↔ Tasks ↔ Calendar ↔ More
(กดแท็บด้านล่างเปลี่ยนได้เลย)
```

### Back Navigation

- **Android**: กดปุ่ม Back → กลับหน้าก่อน
- **iOS**: Swipe ขวา → ซ้าย → กลับหน้าก่อน

---

## 8️⃣ Design Principles

### Mobile-First

- ออกแบบสำหรับมือถือก่อน
- Bottom Navigation ด้านล่าง
- ปุ่มขนาดใหญ่ (min 44px) กดง่าย

### Touch-Optimized

- Spacing กว้างพอ (ไม่กดผิด)
- Active States ชัด (ย่อเมื่อกด)
- Swipe Gestures (ในอนาคต)

### Pastel Blue Theme

- สีหลัก: ฟ้าพาสเทล (Calming, Premium)
- สีรอง: เขียว (Income), แดง (Expense), ม่วง (Points)
- พื้นหลัง: ขาวนวล / น้ำเงินเข้ม (Dark Mode)

### Information Hierarchy

1. **ตัวเลขใหญ่**: Net Worth, Balance, Points
2. **ข้อมูลรอง**: รายละเอียด, เวลา, หมวดหมู่
3. **Action Buttons**: ชัดเจน, สีต่าง

---

## 🔮 Features ที่ยังไม่ได้ทำ (Roadmap)

1. **Authentication** (Login Email/Password)
2. **Form สำหรับบันทึกรายการ** (Income, Expense, Transfer)
3. **Transaction Detail Page**
4. **Task Creation & Assignment**
5. **Event Management**
6. **Settings & Profile Management**
7. **Reports & Analytics**
8. **Data Sync กับ Backend (Go API)**
9. **Offline Mode (PWA)**
10. **Push Notifications**

---

## 📊 สรุป User Journey

### Journey 1: Parent ตรวจสอบการเงิน

```
1. เปิดแอป → เลือก Profile (Dad)
2. ใส่ PIN → Dashboard
3. ดู Net Worth (฿245,680)
4. เลื่อนดู Recent Activity
5. กดแท็บ Wallet → เห็นยอดบัญชีทั้งหมด
6. กดแท็บ Calendar → วางแผนค่าใช้จ่ายเดือนหน้า
```

### Journey 2: Child ทำงานและรับ Points

```
1. เปิดแอป → เลือก Profile (Junior)
2. ไม่ต้องใส่ PIN → Dashboard
3. กดแท็บ Tasks → เห็นงาน "Clean your room" (50 FP)
4. ทำงานจริง
5. กด [Mark Complete] → อัพโหลดรูป
6. รอพ่อ/แม่ตรวจ
7. → ได้ Points 50 FP
8. ไปแลก Reward (ในอนาคต)
```

### Journey 3: Family วางแผนทริป

```
1. Parent เปิด Calendar
2. เห็นว่าวันที่ 10 ว่าง
3. กด FAB → Create Event "Weekend Trip"
4. ตั้งงบ ฿5,000
5. → ทุกคนเห็น Event ในปฏิทิน
6. Parent บันทึกค่าใช้จ่ายระหว่างทริป
7. ดูรายงานหลังเที่ยว ว่าใช้จริง ฿4,800 (ประหยัดได้!)
```

---

## ✅ สรุป

**FamilyOS** ออกแบบมาเพื่อให้ครอบครัวใช้งานได้ง่าย โดย:

- **ข้อมูลการเงินชัดเจน** ไม่ซับซ้อน
- **ระบบให้รางวัลลูก** สนุก มีแรงจูงใจ
- **วางแผนร่วมกัน** ผ่าน Calendar
- **Mobile UX ที่ดี** กดง่าย สวยงาม

พร้อมสำหรับการพัฒนา Backend และ Features ต่อไป! 🚀
