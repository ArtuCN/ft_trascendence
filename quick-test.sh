#!/bin/bash

# 🧪 Quick Test Script - ft_transcendence API Endpoints
# Usage: ./quick-test.sh

echo "================================================"
echo "🧪 TESTING ALL BACKEND ENDPOINTS"
echo "================================================"
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Base URL
API_URL="https://localhost/api"

# Test function
test_endpoint() {
    local name=$1
    local endpoint=$2
    local method=${3:-GET}
    
    echo -e "${BLUE}Testing: $name${NC}"
    echo "Endpoint: $method $endpoint"
    
    if [ "$method" == "GET" ]; then
        response=$(curl -k -s -w "\n%{http_code}" "$API_URL$endpoint")
    fi
    
    status_code=$(echo "$response" | tail -n1)
    body=$(echo "$response" | head -n-1)
    
    if [ "$status_code" == "200" ]; then
        echo -e "${GREEN}✅ SUCCESS (200)${NC}"
        echo "$body" | python3 -m json.tool 2>/dev/null | head -5
    else
        echo -e "${RED}❌ FAILED ($status_code)${NC}"
        echo "$body"
    fi
    echo "---"
    echo ""
}

# Authentication Tests
echo "🔐 AUTHENTICATION ENDPOINTS"
echo "---"
test_endpoint "Get All Users" "/users"
echo ""

# Stats Tests
echo "📊 STATISTICS ENDPOINTS"
echo "---"
test_endpoint "Get All Stats" "/allstats"
test_endpoint "Get User Stats (ID:7)" "/stats?id=7"
echo ""

# Friends Tests
echo "👥 FRIENDS ENDPOINTS"
echo "---"
test_endpoint "Get All Friendships" "/allfriendships"
test_endpoint "Get User Friends (ID:7)" "/friend?id=7"
echo ""

# Matches Tests
echo "🎮 MATCHES ENDPOINTS"
echo "---"
test_endpoint "Get All Matches" "/allmatch"
test_endpoint "Get Player Matches (ID:7)" "/allmatchplayer?id_player=7"
echo ""

# Tournaments Tests
echo "🏆 TOURNAMENTS ENDPOINTS"
echo "---"
test_endpoint "Get All Tournaments" "/alltournament"
echo ""

# Heartbeat Tests
echo "💓 HEARTBEAT ENDPOINTS"
echo "---"
test_endpoint "Get User Last Active (ID:7)" "/heartbeat/get?id=7"
echo ""

echo "================================================"
echo "✅ ALL TESTS COMPLETED"
echo "================================================"
echo ""
echo "📝 For detailed testing, access:"
echo "   https://localhost → Login → 🧪 Test API"
echo ""
