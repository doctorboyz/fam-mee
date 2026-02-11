# FamilyOS Documentation

**Project**: Family Wealth & Lifestyle Manager (FamMee)  
**Last Updated**: 2026-02-05

---

## 📚 Documentation Structure

This project uses a **4-document architecture** for clear separation of concerns:

### 1. [REQUIREMENTS.md](file:///Users/mac/Desktop/fam-mee/documents/REQUIREMENTS.md)

**What we're building and why**

- Product vision and objectives
- Feature specifications
- Business logic rules (transaction status, approval workflows)
- Permission rules (role-based access, sharing authorization)
- User roles and responsibilities
- Development roadmap

**Audience**: Product managers, stakeholders, developers

---

### 2. [DESIGN.md](file:///Users/mac/Desktop/fam-mee/documents/DESIGN.md)

**How it looks and behaves**

- Design principles (mobile-first, touch-optimized)
- Design tokens (colors, typography, spacing)
- Component library (cards, buttons, navigation)
- Layout system and responsive breakpoints
- Interaction patterns (hover states, animations)
- UI logic rules (when to show badges, icons)

**Audience**: Designers, frontend developers

---

### 3. [WORKFLOWS.md](file:///Users/mac/Desktop/fam-mee/documents/WORKFLOWS.md)

**How users accomplish their goals**

- User personas (Dad, Mom, Junior, etc.)
- Use cases (step-by-step flows)
- User journeys (end-to-end scenarios)
- Expected outcomes
- Edge cases and error handling

**Audience**: Product managers, designers, QA

---

### 4. [ARCHITECTURE.md](file:///Users/mac/Desktop/fam-mee/documents/ARCHITECTURE.md)

**How it's built technically**

- Tech stack (Next.js, Go, PostgreSQL)
- System architecture (client-server, API design)
- Database schema (tables, relationships, indexes)
- Data models and API endpoints
- Authentication & authorization implementation
- Edit log schema and audit trail
- Deployment configuration

**Audience**: Backend/frontend developers, DevOps

---

## 🔗 Document Relationships

```
Requirements ──┐
               ├──► What & Why
Design     ────┘

Workflows ────────► How Users Use It

Architecture ─────► How It's Built
```

---

## 🚀 Quick Links

### Getting Started

- [Product Vision](file:///Users/mac/Desktop/fam-mee/documents/REQUIREMENTS.md#1-introduction--vision)
- [User Roles](file:///Users/mac/Desktop/fam-mee/documents/REQUIREMENTS.md#2-user-system--roles)
- [Tech Stack](file:///Users/mac/Desktop/fam-mee/documents/ARCHITECTURE.md#1-technology-stack)

### Key Features

- [Sharing & Authorization](file:///Users/mac/Desktop/fam-mee/documents/REQUIREMENTS.md#63-sharing--authorization-model)
- [Transaction Logic](file:///Users/mac/Desktop/fam-mee/documents/REQUIREMENTS.md#31-transaction-logic)
- [Event & Task System](file:///Users/mac/Desktop/fam-mee/documents/REQUIREMENTS.md#5-event--task-system)

### For Developers

- [Database Schema](file:///Users/mac/Desktop/fam-mee/documents/ARCHITECTURE.md#3-database-schema)
- [API Endpoints](file:///Users/mac/Desktop/fam-mee/documents/ARCHITECTURE.md#4-api-design)
- [Authorization Logic](file:///Users/mac/Desktop/fam-mee/documents/ARCHITECTURE.md#5-authentication--authorization)

### For Designers

- [Design Tokens](file:///Users/mac/Desktop/fam-mee/documents/DESIGN.md#2-design-tokens)
- [Component Library](file:///Users/mac/Desktop/fam-mee/documents/DESIGN.md#3-component-library)
- [UI Logic Rules](file:///Users/mac/Desktop/fam-mee/documents/DESIGN.md#6-ui-logic-rules)

### For Product/QA

- [User Journeys](file:///Users/mac/Desktop/fam-mee/documents/WORKFLOWS.md)
- [Use Cases](file:///Users/mac/Desktop/fam-mee/documents/WORKFLOWS.md#1%EF%B8%8F⃣-use-case-เข้าสู่ระบบและเลือก-profile)

---

## 📝 Change Log

### 2026-02-05 - Documentation Restructure

- ✅ Migrated from 2 documents (prd.md, WORKFLOW.md) to 4 specialized documents
- ✅ Separated business requirements from technical architecture
- ✅ Created dedicated design system documentation
- ✅ Added comprehensive sharing & authorization documentation
- ✅ Archived old files as \*.old

---

## 💡 Contributing

When updating documentation:

1. **Product Changes** → Update [REQUIREMENTS.md](file:///Users/mac/Desktop/fam-mee/documents/REQUIREMENTS.md)
2. **UI/UX Changes** → Update [DESIGN.md](file:///Users/mac/Desktop/fam-mee/documents/DESIGN.md)
3. **User Flow Changes** → Update [WORKFLOWS.md](file:///Users/mac/Desktop/fam-mee/documents/WORKFLOWS.md)
4. **Technical Changes** → Update [ARCHITECTURE.md](file:///Users/mac/Desktop/fam-mee/documents/ARCHITECTURE.md)

Keep cross-references updated when moving/renaming sections!
