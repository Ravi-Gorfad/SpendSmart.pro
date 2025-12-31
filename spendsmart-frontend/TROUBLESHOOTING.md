# Troubleshooting Guide - Blank Screen Issue

## Quick Fixes

### 1. Check Browser Console
Open your browser's Developer Tools (F12) and check the Console tab for any JavaScript errors.

### 2. Clear Browser Cache
- Press `Ctrl + Shift + Delete` (Windows) or `Cmd + Shift + Delete` (Mac)
- Clear cached images and files
- Reload the page

### 3. Restart Development Server
```bash
# Stop the server (Ctrl + C)
# Then restart:
cd spendsmart-frontend
npm run dev
```

### 4. Check if Dependencies are Installed
```bash
cd spendsmart-frontend
npm install
```

### 5. Check Node Version
Make sure you're using Node.js 18 or higher:
```bash
node --version
```

## Common Issues

### Issue: Blank White Screen
**Possible Causes:**
1. JavaScript error preventing render
2. Missing dependencies
3. CSS not loading
4. React error

**Solutions:**
1. Open browser console (F12) and check for errors
2. Check if `node_modules` exists: `ls node_modules` (or `dir node_modules` on Windows)
3. Reinstall dependencies: `npm install`
4. Clear browser cache and hard refresh (Ctrl + F5)

### Issue: "Cannot read property" errors
**Solution:** The error boundary should catch these. Check the console for the specific error.

### Issue: Styles not loading
**Solution:** 
1. Check if `bootstrap/dist/css/bootstrap.min.css` is imported in `main.jsx`
2. Check if `./styles/index.css` exists and is imported
3. Clear browser cache

### Issue: Routing not working
**Solution:**
1. Make sure you're accessing `http://localhost:3000` (or the port shown in terminal)
2. Check if React Router is properly installed
3. Check browser console for routing errors

## Debug Steps

1. **Check Terminal Output**
   - Look for compilation errors
   - Check if the dev server started successfully
   - Note the URL (usually http://localhost:3000)

2. **Check Browser Console**
   - Open DevTools (F12)
   - Go to Console tab
   - Look for red error messages
   - Take a screenshot of any errors

3. **Check Network Tab**
   - Open DevTools (F12)
   - Go to Network tab
   - Reload the page
   - Check if files are loading (look for 404 errors)

4. **Verify Files Exist**
   ```bash
   # Check if main files exist
   ls src/main.jsx
   ls src/App.jsx
   ls src/pages/Landing.jsx
   ```

5. **Test Simple Component**
   If still not working, try creating a simple test:
   - Temporarily replace `App.jsx` content with:
   ```jsx
   function App() {
     return <div>Hello World</div>;
   }
   export default App;
   ```
   - If this works, the issue is in the Landing component
   - If this doesn't work, the issue is in the setup

## Still Not Working?

1. **Delete node_modules and reinstall:**
   ```bash
   cd spendsmart-frontend
   rm -rf node_modules package-lock.json
   npm install
   npm run dev
   ```

2. **Check for port conflicts:**
   - Make sure port 3000 (or the port shown) is not in use
   - Try changing the port in `vite.config.js`

3. **Check file permissions:**
   - Make sure you have read/write permissions
   - Try running as administrator (Windows) or with sudo (Mac/Linux)

4. **Check for syntax errors:**
   - Look for any red underlines in your IDE
   - Check for missing imports
   - Check for unclosed brackets/parentheses

## Getting Help

If none of the above works, please provide:
1. Screenshot of browser console errors
2. Terminal output when running `npm run dev`
3. Browser and version you're using
4. Node.js version (`node --version`)
5. Operating system


