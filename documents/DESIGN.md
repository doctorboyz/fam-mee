# UI/UX Design System

**Project**: FamilyOS (FamMee)  
**Version**: 1.0  
**Last Updated**: 2026-02-05

---

## 📋 Table of Contents

1. [Design Principles](#1-design-principles)
2. [Design Tokens](#2-design-tokens)
3. [Component Library](#3-component-library)
4. [Layout System](#4-layout-system)
5. [Interaction Patterns](#5-interaction-patterns)
6. [UI Logic Rules](#6-ui-logic-rules)

> **Related Documents**:
>
> - [WORKFLOWS.md](file:///Users/mac/Desktop/fam-mee/documents/WORKFLOWS.md) - User journeys using these components
> - [REQUIREMENTS.md](file:///Users/mac/Desktop/fam-mee/documents/REQUIREMENTS.md) - Business requirements

---

## 1. Design Principles

### 1.1 Mobile-First

- ออกแบบสำหรับมือถือก่อน
- Bottom Navigation ด้านล่าง
- ปุ่มขนาดใหญ่ (min 44px) กดง่าย
- Thumb-friendly zones

### 1.2 Touch-Optimized

- **Spacing กว้างพอ** (ไม่กดผิด) - ระยะห่างระหว่างปุ่มขั้นต่ำ 8px
- **Active States ชัด** (ย่อเมื่อกด) - scale(0.95) on tap
- **Swipe Gestures** (ในอนาคต) - สำหรับ delete, archive

### 1.3 Pastel Blue Theme

- **สีหลัก**: ฟ้าพาสเทล (Calming, Premium)
- **สีรอง**: เขียว (Income), แดง (Expense), ม่วง (Points)
- **พื้นหลัง**: ขาวนวล / น้ำเงินเข้ม (Dark Mode)

### 1.4 Information Hierarchy

**Priority Order**:

1. **ตัวเลขใหญ่**: Net Worth, Balance, Points
2. **ข้อมูลรอง**: รายละเอียด, เวลา, หมวดหมู่
3. **Action Buttons**: ชัดเจน, สีต่าง

---

## 2. Design Tokens

### 2.1 Colors

#### Primary Palette

```css
--primary-50: #eff6ff; /* Lightest blue */
--primary-100: #dbeafe;
--primary-200: #bfdbfe;
--primary-300: #93c5fd;
--primary-400: #60a5fa; /* Pastel blue - Main */
--primary-500: #3b82f6;
--primary-600: #2563eb;
--primary-700: #1d4ed8; /* Dark blue */
```

#### Semantic Colors

```css
/* Success / Income */
--success-light: #bbf7d0;
--success: #22c55e;
--success-dark: #16a34a;

/* Error / Expense */
--error-light: #fecaca;
--error: #ef4444;
--error-dark: #dc2626;

/* Warning */
--warning-light: #fed7aa;
--warning: #f97316;
--warning-dark: #ea580c;

/* Family Points */
--points-light: #e9d5ff;
--points: #a855f7;
--points-dark: #7e22ce;
```

#### Neutral Colors

```css
--gray-50: #f9fafb;
--gray-100: #f3f4f6;
--gray-200: #e5e7eb;
--gray-300: #d1d5db;
--gray-400: #9ca3af;
--gray-500: #6b7280;
--gray-600: #4b5563;
--gray-700: #374151;
--gray-800: #1f2937;
--gray-900: #111827;
```

### 2.2 Typography

#### Font Family

```css
/* Primary Font */
--font-primary: "Inter", -apple-system, BlinkMacSystemFont, sans-serif;

/* Monospace (for numbers) */
--font-mono: "JetBrains Mono", "Courier New", monospace;
```

#### Font Sizes

```css
--text-xs: 0.75rem; /* 12px */
--text-sm: 0.875rem; /* 14px */
--text-base: 1rem; /* 16px */
--text-lg: 1.125rem; /* 18px */
--text-xl: 1.25rem; /* 20px */
--text-2xl: 1.5rem; /* 24px */
--text-3xl: 1.875rem; /* 30px */
--text-4xl: 2.25rem; /* 36px */
--text-5xl: 3rem; /* 48px */
```

#### Font Weights

```css
--font-light: 300;
--font-normal: 400;
--font-medium: 500;
--font-semibold: 600;
--font-bold: 700;
```

### 2.3 Spacing

```css
--space-1: 0.25rem; /* 4px */
--space-2: 0.5rem; /* 8px */
--space-3: 0.75rem; /* 12px */
--space-4: 1rem; /* 16px */
--space-5: 1.25rem; /* 20px */
--space-6: 1.5rem; /* 24px */
--space-8: 2rem; /* 32px */
--space-10: 2.5rem; /* 40px */
--space-12: 3rem; /* 48px */
```

### 2.4 Border Radius

```css
--radius-sm: 0.375rem; /* 6px */
--radius-md: 0.5rem; /* 8px */
--radius-lg: 0.75rem; /* 12px */
--radius-xl: 1rem; /* 16px */
--radius-2xl: 1.5rem; /* 24px */
--radius-full: 9999px; /* Circle */
```

### 2.5 Shadows

```css
--shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);
--shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1);
--shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1);
--shadow-xl: 0 20px 25px -5px rgb(0 0 0 / 0.1);
```

---

## 3. Component Library

### 3.1 Cards

#### Net Worth Card

```
┌──────────────────────────────────────┐
│  Gradient Background (Blue → Purple) │
│                                      │
│  Total Net Worth                     │ ← text-sm, gray-100
│  ฿245,680                            │ ← text-4xl, white, bold
│                                      │
│  Assets: ฿320,500  ↗                 │ ← text-base, white/80
│  Liabilities: ฿74,820  ↘             │
└──────────────────────────────────────┘

Style:
- Background: linear-gradient(135deg, primary-400, points-400)
- Padding: space-6
- Border Radius: radius-xl
- Shadow: shadow-lg
```

#### Account Card

```
┌──────────────────────────────────────┐
│  💵  Cash Wallet        👥 Shared    │ ← Emoji + Shared badge
│      CASH                            │ ← text-xs, gray-500
│                                      │
│      ฿3,250                          │ ← text-2xl, bold
│                                      │
│      Shared with: Mom                │ ← text-sm, gray-600
└──────────────────────────────────────┘

Style:
- Background: white (light mode) / gray-800 (dark mode)
- Border: 1px solid gray-200
- Padding: space-4
- Border Radius: radius-lg
- Hover: shadow-md, scale(1.02)
```

#### Transaction Card

```
┌──────────────────────────────────────┐
│  🛒  Grocery Shopping                │
│  Food & Dining • 2h ago     -฿1,350  │
│                             ✏️ 1 edit │
│                                      │
│  Created by: Mom 👩                  │ ← Avatar + name
└──────────────────────────────────────┘

Style:
- Background: gray-50 (light) / gray-800 (dark)
- Padding: space-4
- Border Radius: radius-md
- Border-left: 4px solid (color based on type)
  - Income: success-500
  - Expense: error-500
  - Transfer: primary-500
```

### 3.2 Buttons

#### Primary Button

```css
.btn-primary {
  background: var(--primary-400);
  color: white;
  padding: var(--space-3) var(--space-6);
  border-radius: var(--radius-lg);
  font-weight: var(--font-semibold);
  min-height: 44px;
}

.btn-primary:hover {
  background: var(--primary-500);
  transform: translateY(-1px);
  box-shadow: var(--shadow-md);
}

.btn-primary:active {
  transform: scale(0.95);
}
```

#### Quick Action Buttons

```
[↓ Income]  [↑ Expense]  [↔ Transfer]  [✓ Task]
  Green        Red          Blue         Purple

Size: 80px × 80px
Border Radius: radius-xl
Icon Size: 24px
Font: text-sm, semibold
```

### 3.3 Navigation

#### Bottom Tab Bar

```
┌──────────────────────────────────────┐
│  [🏠]   [💰]   [✓]   [📅]   [☰]     │
│  Home   Wallet Tasks Calendar More   │
└──────────────────────────────────────┘

Height: 64px
Background: white (light) / gray-900 (dark)
Border-top: 1px solid gray-200
Safe Area: padding-bottom for iOS notch

Active State:
- Icon: primary-400
- Label: primary-600
- Stroke Width: 2.5

Inactive State:
- Icon: gray-400
- Label: gray-500
- Stroke Width: 2
```

#### FAB (Floating Action Button)

```
┌──────────────────────────────────────┐
│                                  [+] │ ← Bottom right
└──────────────────────────────────────┘

Size: 56px × 56px
Background: primary-400
Color: white
Border Radius: radius-full
Shadow: shadow-xl
Position: fixed, bottom 80px, right 16px

On Tap:
- Ripple effect
- Scale animation
- Open Quick Add Menu
```

### 3.4 Badges & Tags

#### Edit Badge

```
✏️ 3 edits

Background: gray-100
Color: gray-600
Padding: 2px 8px
Border Radius: radius-sm
Font Size: text-xs
```

#### Shared Icon

```
👥 Shared

Color: primary-400
Font Size: text-sm
```

#### Status Badges

```
[✓ Completed]  [🕐 Pending]  [✗ Rejected]
   Green         Primary        Red

Padding: 4px 12px
Border Radius: radius-md
Font: text-sm, medium
```

---

## 4. Layout System

### 4.1 Screen Structure

```
┌─────────────────────────────────┐
│  Header (Safe Area)             │ ← 60px + safe area
├─────────────────────────────────┤
│                                 │
│                                 │
│  Main Content                   │ ← Scrollable
│  (Padding: space-4)             │
│                                 │
│                                 │
├─────────────────────────────────┤
│  Bottom Navigation              │ ← 64px + safe area
└─────────────────────────────────┘
```

### 4.2 Container Widths

```css
--container-sm: 640px; /* Mobile */
--container-md: 768px; /* Tablet */
--container-lg: 1024px; /* Desktop */
--container-xl: 1280px; /* Large Desktop */
```

### 4.3 Grid System

```css
.grid-2-col {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--space-4);
}

.grid-4-col {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: var(--space-3);
}
```

---

## 5. Interaction Patterns

### 5.1 Touch Feedback

**Tap Animation**:

```css
.touchable:active {
  transform: scale(0.95);
  transition: transform 100ms ease-out;
}
```

**Ripple Effect**:

```css
/* Material Design ripple on tap */
position: relative;
overflow: hidden;

/* Ripple spans from tap point */
```

### 5.2 Hover States (Desktop)

**Card Hover**:

```css
.card:hover {
  box-shadow: var(--shadow-lg);
  transform: translateY(-2px);
  transition: all 200ms ease-out;
}
```

**Button Hover**:

```css
.button:hover {
  filter: brightness(1.1);
  transform: translateY(-1px);
}
```

### 5.3 Loading States

**Skeleton Loader**:

```
┌──────────────────────────────────────┐
│  ▓▓▓▓▓▓▓                             │
│  ▓▓▓▓▓▓▓▓▓▓▓▓                         │
│                                      │
│  ▓▓▓▓▓  ▓▓▓▓▓▓▓▓                     │
└──────────────────────────────────────┘

Background: gray-200
Animation: shimmer (1.5s infinite)
Border Radius: matches actual component
```

**Spinner**:

```
Loading...  ⟳

Size: 24px
Color: primary-400
Animation: spin (1s linear infinite)
```

---

## 6. UI Logic Rules

### 6.1 Badge Display Rules

**Edit Badge Display**:

- แสดง "✏️ n edits" เมื่อ Transaction ถูกแก้ไข ≥ 1 ครั้ง
- ไม่แสดงถ้าไม่เคยแก้ไข (edit_count = 0)
- สี: gray-600 (normal), warning-600 (≥5 edits)

**Shared Icon Display**:

- แสดง "👥 Shared" ข้างชื่อ Account/Event ที่ shared_with_users.length > 0
- ตำแหน่ง: ขวาบน (absolute position)

**Status Badge Color**:

```javascript
const statusColors = {
  PENDING: "primary",
  SUBMITTED: "warning",
  APPROVED: "success",
  REJECTED: "error",
  COMPLETED: "success",
  CANCELLED: "gray",
  VOID: "error",
};
```

### 6.2 Avatar Display Rules

**Created By Avatar**:

- แสดง Avatar ขนาดเล็ก (24px) ข้าง Transaction
- ตำแหน่ง: ล่างซ้าย
- Tooltip on hover: "Created by [name]"

**Last Edited Avatar**:

- แสดงเฉพาะถ้า last_edited_by_user_id !== created_by_user_id
- ตำแหน่ง: ล่างขวา
- Tooltip: "Last edited by [name]"

### 6.3 Amount Display Rules

**Number Formatting**:

```javascript
// Thai Baht
const formatAmount = (amount) => {
  return new Intl.NumberFormat("th-TH", {
    style: "currency",
    currency: "THB",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
};
```

**Color Based on Type**:

- **Income**: `success-600` (green)
- **Expense**: `error-600` (red)
- **Transfer**: `gray-700` (neutral)
- **Prefix**: + for income, - for expense

**Example**:

```
+฿45,000  (green)
-฿1,500   (red)
฿125,000  (neutral - balance)
```

### 6.4 Icon Selection Rules

**Account Type Icons**:

```javascript
const accountIcons = {
  CASH: "💵",
  BANK: "🏦",
  CREDIT: "💳",
  INVESTMENT: "📈",
  CRYPTO: "₿",
  PROPERTY: "🏠",
};
```

**Transaction Category Icons**:

- Food & Dining: 🍴
- Shopping: 🛒
- Transportation: 🚗
- Utilities: 💡
- Entertainment: 🎬
- Healthcare: 🏥

### 6.5 Date & Time Display

**Relative Time** (≤ 7 days):

```
Just now
5 minutes ago
2 hours ago
Yesterday
3 days ago
```

**Absolute Date** (> 7 days):

```
05/02/2026
Jan 15, 2026
```

**Time Format**:

```
24-hour: 14:30
12-hour: 2:30 PM (for en-US locale)
```

---

**Document Version**: 1.0  
**Last Updated**: 2026-02-05  
**Maintained By**: Design Team
