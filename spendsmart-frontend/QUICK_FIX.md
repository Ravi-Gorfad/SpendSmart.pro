# Quick Fix for Blank Screen

## Immediate Steps:

1. **Open Browser Console (F12)**
   - Look for any red errors
   - Copy the error message

2. **Try these URLs:**
   - http://localhost:3000/test
   - http://localhost:3000/simple
   - http://localhost:3000/

3. **Restart Dev Server:**
   ```bash
   # Press Ctrl+C to stop
   cd spendsmart-frontend
   npm run dev
   ```

4. **Clear Browser Cache:**
   - Press Ctrl+Shift+Delete
   - Clear cached files
   - Reload page with Ctrl+F5

## If Still Not Working:

**Share these details:**
1. What error appears in browser console (F12 → Console tab)
2. What the terminal shows when you run `npm run dev`
3. Which URL works (if any): /test, /simple, or /

## Most Common Issues:

1. **Port already in use** - Change port in vite.config.js
2. **Missing dependencies** - Run `npm install`
3. **JavaScript error** - Check browser console
4. **CSS not loading** - Check Network tab in DevTools


