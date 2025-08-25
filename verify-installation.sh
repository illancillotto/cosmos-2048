#!/bin/bash

# 🔍 Cosmos 2048 Installation Verification Script
# Verifies that all components are properly installed and running

set -e

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo "🔍 Verifying Cosmos 2048 Installation"
echo "===================================="

# Test results
TESTS_PASSED=0
TESTS_TOTAL=0

# Function to run test
run_test() {
    local test_name="$1"
    local test_command="$2"
    TESTS_TOTAL=$((TESTS_TOTAL + 1))
    
    echo -n "Testing $test_name... "
    
    if eval "$test_command" &>/dev/null; then
        echo -e "${GREEN}✅ PASS${NC}"
        TESTS_PASSED=$((TESTS_PASSED + 1))
        return 0
    else
        echo -e "${RED}❌ FAIL${NC}"
        return 1
    fi
}

# System tests
echo "🖥️  System Requirements:"
run_test "Docker installed" "command -v docker"
run_test "Docker Compose available" "docker compose version || docker-compose --version"
run_test "Docker daemon running" "docker info"
run_test "User in docker group" "groups \$USER | grep -q docker"

echo ""
echo "📁 Project Files:"
run_test "docker-compose.prod.yml exists" "test -f docker-compose.prod.yml"
run_test "nginx configuration exists" "test -f nginx/nginx.conf"
run_test "start-production.sh executable" "test -x start-production.sh"
run_test "API source exists" "test -d apps/api/src"
run_test "Frontend source exists" "test -d apps/web/app"

echo ""
echo "🌐 Network & Ports:"
run_test "Port 80 available or in use" "! ss -tulpn | grep -q ':80 ' || ss -tulpn | grep -q ':80 '"
run_test "Internet connectivity" "curl -s --connect-timeout 5 https://google.com"

echo ""
echo "🐳 Docker Services (if running):"
if docker compose -f docker-compose.prod.yml ps | grep -q "Up"; then
    run_test "Nginx container running" "docker compose -f docker-compose.prod.yml ps nginx | grep -q Up"
    run_test "Frontend container running" "docker compose -f docker-compose.prod.yml ps web | grep -q Up"
    run_test "API container running" "docker compose -f docker-compose.prod.yml ps api | grep -q Up"
    run_test "MongoDB container running" "docker compose -f docker-compose.prod.yml ps mongodb | grep -q Up"
    
    echo ""
    echo "🔗 Application Endpoints:"
    run_test "Frontend accessible" "curl -s -o /dev/null -w '%{http_code}' http://localhost/ | grep -q 200"
    run_test "API health check" "curl -s -o /dev/null -w '%{http_code}' http://localhost/health | grep -q 200"
else
    echo -e "${YELLOW}⚠️  Services not running. Run ./start-production.sh to start them.${NC}"
fi

echo ""
echo "🎛️ Environment Configuration:"
if [ -f "apps/api/.env" ]; then
    run_test "API environment configured" "grep -q JWT_SECRET apps/api/.env"
else
    echo -e "${YELLOW}⚠️  API .env file not found${NC}"
fi

if [ -f "apps/web/.env.local" ]; then
    run_test "Frontend environment configured" "grep -q NEXT_PUBLIC_API_URL apps/web/.env.local"
else
    echo -e "${YELLOW}⚠️  Frontend .env.local file not found${NC}"
fi

echo ""
echo "📊 Results Summary:"
echo "=================="
echo -e "Tests passed: ${GREEN}$TESTS_PASSED${NC}/$TESTS_TOTAL"

if [ $TESTS_PASSED -eq $TESTS_TOTAL ]; then
    echo -e "${GREEN}🎉 All tests passed! Your installation looks good.${NC}"
    exit 0
elif [ $TESTS_PASSED -gt $((TESTS_TOTAL / 2)) ]; then
    echo -e "${YELLOW}⚠️  Most tests passed, but some issues detected.${NC}"
    exit 1
else
    echo -e "${RED}❌ Many tests failed. Please check your installation.${NC}"
    exit 2
fi