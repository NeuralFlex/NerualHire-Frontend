#  NeuralHire Frontend

The **NeuralHire Frontend** is the React-based user interface for the NeuralHire HR Recruitment Platform by **NeuralFlex AI**.  
It provides modules for job management, candidate tracking, ATS pipeline visualization, and dashboard analytics — all with a modern, responsive UI.

---

##  Features

-  Built with **React (Create React App)**
-  Styled using **Bootstrap 5** and **Tailwind CSS**
-  API requests handled via **Axios**
-  Routing with **React Router DOM v7**
-  Beautiful icons using **Lucide React** & **React Icons**
-  Responsive dashboard layout
-  Integrated with Django REST API backend

---

##  Tech Stack

| Category | Technology |
|-----------|-------------|
| **Framework** | React 19 |
| **Styling** | Tailwind CSS + Bootstrap 5 |
| **Routing** | React Router DOM |
| **HTTP Client** | Axios |
| **Icons** | Lucide React, React Icons |
| **Testing** | React Testing Library, Jest |
| **Build Tool** | Create React App (react-scripts) |

---

##  Prerequisites

Before starting, ensure you have:

- [Node.js](https://nodejs.org/) version **≥ 16**
- npm (comes with Node.js) or yarn
- Access to the NeuralHire **Backend API**

---

##  Installation

Clone this repository:

```bash
git clone https://github.com/NeuralFlex/NerualHire-Frontend.git
cd NerualHire-Frontend
```

Install all dependencies:
```bash
npm install 
yarn install (if using yarn)
```

Manual Package Installation:
```bash
npm install react react-dom react-router-dom react-scripts axios bootstrap lucide-react react-icons web-vitals
npm install @testing-library/react @testing-library/jest-dom @testing-library/user-event @testing-library/dom
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```
For yarn:
```bash
yarn add react react-dom react-router-dom react-scripts axios bootstrap lucide-react react-icons web-vitals
yarn add @testing-library/react @testing-library/jest-dom @testing-library/user-event @testing-library/dom
yarn add -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

Create a .env file in the root directory and define:
```bash
REACT_APP_API_BASE_URL=http://127.0.0.1:8000 (backend API URL)
REACT_APP_ENV=development
```

Run locally:
Start the development server:
```bash
npm start
or yarn start
```
Then open your browser and go to:
```bash
http://localhost:3000
```


##  Notes

Ensure your Django backend is running before starting the frontend.

Tailwind CSS and Bootstrap can be used together — Tailwind takes priority in utility-based styles.

If Tailwind styles don’t apply, check tailwind.config.js and ensure content includes ./src/**/*.{js,jsx,ts,tsx}