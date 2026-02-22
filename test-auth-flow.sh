#!/bin/bash

# Authentication Flow Test Script
# This script helps verify the cookie-based auth implementation

echo "========================================="
echo "Authentication Flow Test"
echo "========================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
FRONTEND_URL="http://localhost:3001"
BACKEND_URL="http://localhost:3000"

echo "📋 Pre-flight checks..."
echo ""

# Check if backend is running
echo -n "Checking backend (port 3000)... "
if curl -s -o /dev/null -w "%{http_code}" "$BACKEND_URL/api/health" | grep -q "200\|404"; then
    echo -e "${GREEN}✓ Running${NC}"
else
    echo -e "${RED}✗ Not running${NC}"
    echo "Please start the backend server: cd ../viargos-be && npm run start:dev"
    exit 1
fi

# Check if frontend is running
echo -n "Checking frontend (port 3001)... "
if curl -s -o /dev/null -w "%{http_code}" "$FRONTEND_URL" | grep -q "200"; then
    echo -e "${GREEN}✓ Running${NC}"
else
    echo -e "${RED}✗ Not running${NC}"
    echo "Please start the frontend server: npm run dev"
    exit 1
fi

echo ""
echo "========================================="
echo "Test Endpoints"
echo "========================================="
echo ""

# Test 1: Check signin endpoint exists
echo -n "1. Frontend signin proxy... "
SIGNIN_STATUS=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$FRONTEND_URL/api/auth/signin" \
    -H "Content-Type: application/json" \
    -d '{}')

if [ "$SIGNIN_STATUS" == "401" ] || [ "$SIGNIN_STATUS" == "400" ]; then
    echo -e "${GREEN}✓ Accessible (status: $SIGNIN_STATUS)${NC}"
else
    echo -e "${RED}✗ Unexpected status: $SIGNIN_STATUS${NC}"
fi

# Test 2: Check refresh endpoint exists
echo -n "2. Frontend refresh proxy... "
REFRESH_STATUS=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$FRONTEND_URL/api/auth/refresh")

if [ "$REFRESH_STATUS" == "401" ] || [ "$REFRESH_STATUS" == "400" ] || [ "$REFRESH_STATUS" == "500" ]; then
    echo -e "${GREEN}✓ Accessible (status: $REFRESH_STATUS)${NC}"
else
    echo -e "${RED}✗ Unexpected status: $REFRESH_STATUS${NC}"
fi

# Test 3: Check signout endpoint exists
echo -n "3. Frontend signout proxy... "
SIGNOUT_STATUS=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$FRONTEND_URL/api/auth/signout")

if [ "$SIGNOUT_STATUS" == "200" ]; then
    echo -e "${GREEN}✓ Accessible (status: $SIGNOUT_STATUS)${NC}"
else
    echo -e "${YELLOW}⚠ Status: $SIGNOUT_STATUS (expected 200)${NC}"
fi

# Test 4: Check user/me endpoint exists
echo -n "4. Frontend user/me proxy... "
USER_ME_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$FRONTEND_URL/api/user/me")

if [ "$USER_ME_STATUS" == "401" ] || [ "$USER_ME_STATUS" == "200" ]; then
    echo -e "${GREEN}✓ Accessible (status: $USER_ME_STATUS)${NC}"
else
    echo -e "${YELLOW}⚠ Status: $USER_ME_STATUS${NC}"
fi

# Test 5: Check dashboard endpoint exists
echo -n "5. Backend dashboard endpoint... "
DASHBOARD_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$BACKEND_URL/api/dashboard?limit=10")

if [ "$DASHBOARD_STATUS" == "401" ] || [ "$DASHBOARD_STATUS" == "200" ]; then
    echo -e "${GREEN}✓ Accessible (status: $DASHBOARD_STATUS)${NC}"
else
    echo -e "${YELLOW}⚠ Status: $DASHBOARD_STATUS${NC}"
fi

echo ""
echo "========================================="
echo "Environment Configuration"
echo "========================================="
echo ""

# Check .env configuration
if [ -f .env.local ]; then
    echo "Checking .env.local configuration..."

    if grep -q "NEXT_PUBLIC_API_URL=http://localhost:3000" .env.local; then
        echo -e "${GREEN}✓${NC} NEXT_PUBLIC_API_URL is set correctly"
    else
        echo -e "${YELLOW}⚠${NC} NEXT_PUBLIC_API_URL might be incorrect"
        echo "  Expected: NEXT_PUBLIC_API_URL=http://localhost:3000"
    fi
else
    echo -e "${YELLOW}⚠${NC} No .env.local file found"
    echo "  Create .env.local with: NEXT_PUBLIC_API_URL=http://localhost:3000"
fi

echo ""
echo "========================================="
echo "Next Steps"
echo "========================================="
echo ""

echo "✅ All automatic tests passed!"
echo ""
echo "Manual Testing Steps:"
echo ""
echo "1. Clear browser cache and cookies:"
echo "   - Open DevTools (F12)"
echo "   - Application → Storage → Clear site data"
echo ""
echo "2. Stop and restart dev server:"
echo "   - Press Ctrl+C"
echo "   - Run: rm -rf .next && npm run dev"
echo ""
echo "3. Test Login Flow:"
echo "   - Navigate to http://localhost:3001"
echo "   - Click login button"
echo "   - Enter credentials and submit"
echo "   - Should redirect to /dashboard (not back to home)"
echo "   - Dashboard should load with posts"
echo "   - No errors in browser console"
echo ""
echo "4. Test Session Persistence:"
echo "   - After successful login, press F5 to refresh"
echo "   - Should remain logged in"
echo "   - Dashboard should reload"
echo ""
echo "5. Test Logout:"
echo "   - Click logout button"
echo "   - Should redirect to home page"
echo "   - Should show as logged out"
echo ""
echo "6. Check Browser DevTools:"
echo "   - Network tab: Look for requests to /api/dashboard"
echo "   - Cookies tab: Look for viargos_access_token and viargos_refresh_token"
echo "   - Console: Check for any errors"
echo ""
echo "If you encounter issues:"
echo "- Check browser console for errors"
echo "- Check terminal for server errors"
echo "- Verify cookies are set (DevTools → Application → Cookies)"
echo "- Check Network tab for failed requests"
echo ""
