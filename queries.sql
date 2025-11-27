SELECT * FROM events WHERE event_type = '${eventType}' AND user_id = ${userId};

SELECT u.email, u.plan_type, COUNT(e.id) as event_count 
FROM users u 
LEFT JOIN events e ON u.id = e.user_id 
GROUP BY u.id;

SELECT event_type, COUNT(*) as count 
FROM events 
WHERE timestamp BETWEEN '2024-01-01' AND '2024-12-31' 
GROUP BY event_type 
ORDER BY count DESC;
