# 📅 TaskBoard

**TaskBoard** is a simplified **Google Calendar-style** month view task planner focused on productivity scheduling.  
It features drag & drop task creation, categorization, live filtering, and search — all in a clean, user-friendly interface.

---

## 🚀 Features

### 🖱 Task Creation
- **Drag across consecutive days** to select a range.
- **Modal** to enter:
  - **Task Name**
  - **Category**: `To Do`, `In Progress`, `Review`, `Completed`
- Task appears as a **bar** spanning selected days.

### 🔄 Task Editing
- **Drag & Drop** tasks to different dates while retaining duration.
- **Resize tasks** by stretching from:
  - **Left edge** → Adjust start date
  - **Right edge** → Adjust end date
- Live visual feedback while resizing.

### 🏷 Task Categories
- Categories:
  - ✅ To Do
  - 🚧 In Progress
  - 🔍 Review
  - 🎯 Completed
- Change category via modal during creation or editing.

### 🔍 Filtering & Searching
- **Category Filter** (multi-select checkboxes)
- **Time-Based Filter** (1 week, 2 weeks, 3 weeks)
- **Live Search** by task name
- Filters are **cumulative** and update in real-time.

### 🎨 UI & Functional Details
- Clean & minimal design
- Accurate month view layout with correct day labels
- All data stored **in-memory** (or via `localStorage` if enabled)
- **Today’s date** highlighted for quick reference

---

## 🛠 Tech Stack
- **React + TypeScript**
- **Drag & Drop Library**: `react-dnd`, `@dnd-kit/core`, or `interact.js`
- **Date Utility**: `date-fns` or `moment`

---

## ⚙️ Installation & Setup
```bash
# Clone repository
git clone https://github.com/dhruval03/TaskBoard.git

# Navigate to project folder
cd TaskBoard

# Install dependencies
npm install

# Run development server
npm run dev
```
---

## 👤 Author  
**Dhruval Maniyar**  
📧 [maniyardhruval1290@gmail.com](mailto:maniyardhruval1290@gmail.com)  
