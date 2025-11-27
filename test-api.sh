#!/bin/bash

echo "Testing Analytics API..."

echo "1. Dashboard stats:"
curl -s http://localhost:3000/metrics/dashboard | jq .

echo -e "\n2. User analytics:"
curl -s http://localhost:3000/users | jq .

echo -e "\n3. Events by type:"
curl -s "http://localhost:3000/events?type=page_view&userId=1" | jq .

echo -e "\n4. Generate user activity report:"
curl -s -X POST http://localhost:3000/reports/generate \
  -H "Content-Type: application/json" \
  -d '{"reportType":"user_activity","userId":1,"dateRange":"7d"}' | jq .

echo -e "\n5. Process event with business logic:"
curl -s -X POST http://localhost:3000/events/process \
  -H "Content-Type: application/json" \
  -d '{"eventType":"page_view","rawData":{"page":"/home","duration":30},"userId":1,"sessionId":"sess_test"}' | jq .

echo -e "\n6. Calculate retention metrics:"
curl -s "http://localhost:3000/metrics/retention" | jq .

echo -e "\n7. Execute report:"
curl -s "http://localhost:3000/reports/1/execute" | jq .
