# Auth UI Implementation Plan

## Goal Description
Implement the UI for the login and register pages based on the provided reference images. The implementation will use SvelteKit and Tailwind CSS, adhering strictly to the user's constraints regarding layout and styling.

The login page design has been updated based on the latest reference image, changing the form position, layout, and styling.

## Open Questions
None at the moment. The requirements are clear.

## Proposed Changes

### Routes

#### [MODIFY] src/routes/(auth)/login/+page.svelte
Update the login page to match the new reference design:
- **Layout:** `grid grid-cols-1 md:grid-cols-2 min-h-screen`.
- **Left Column (Visual):** A white background (`bg-white`) containing centered placeholder text "Mau isi kek gambar" and pagination dots at the bottom.
- **Right Column (Form Container):** A light gray background (`bg-slate-50`). Centered using Flexbox (`flex flex-col justify-center items-center p-8`).
- **Form Card:** The form elements will be wrapped inside a white card (`bg-white p-8 sm:p-12 rounded-[2rem] shadow-sm w-full max-w-md`).
- **Content Structure inside Card:**
  - Title: "Welcome Back" (Centered, text-3xl font-bold).
  - Subtitle: "Isi apa ya" (Centered, text-gray-500 text-sm, mb-8).
  - Email Field: Label "Email", input with mail icon and placeholder "blukutuk@company.com".
  - Password Field: Label "Password" with "Forgot password?" link on the right. Input with lock icon, eye icon, and dots placeholder.
  - Checkbox: "Remember me for 30 days" with a circular-style empty radio/checkbox.
  - Submit Button: "Sign In" (blue background, rounded-full, w-full, mt-6).
  - Divider: "OR CONTINUE WITH" text between two thin lines.
  - Social Buttons: "Google" and "Facebook", positioned side-by-side (`grid grid-cols-2 gap-4`), pill-shaped outline buttons.
  - Footer Link: "Don't have an account? Sign up here ->" at the very bottom of the card.

#### [NO CHANGE] src/routes/(auth)/register/+page.svelte
The register page will remain as implemented based on the first reference image.

## Layout Rules Applied
- **Tailwind CSS**: Exclusively used for styling.
- **Grid Layout**: `grid grid-cols-1 md:grid-cols-2 min-h-screen` will form the base layout.
- **Flexbox Centering**: No `position: absolute` for structural layout. Forms and cards will be vertically and horizontally centered using Flexbox (`flex`, `items-center`, `justify-center`).
- **Simplified Social Icons**: Only text "Google" and "Facebook" inside the buttons.

## Verification Plan

### Manual Verification
- Navigate to `/login` in the browser.
- Verify the layout correctly splits into two columns on desktop, with the form on the right and placeholder text on the left.
- Verify the form is inside a white card with rounded corners on a light gray background.
- Verify social login buttons are at the bottom and displayed side-by-side.
- Ensure no `absolute` positioning is used for form elements layout.
