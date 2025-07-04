-- INSERTION RAPIDE EMPLOYÉS RH - Script simplifié pour Supabase SQL Editor
-- =================================================================

-- Insérer 5 employés de test avec des données réalistes (colonnes de base uniquement)
INSERT INTO employees (
    employee_number, first_name, last_name, work_email,
    branch_id, department_id, position_id,
    hire_date, start_date, employment_status, employment_type,
    current_salary, performance_score
) VALUES 
(
    'EMP001', 'Jean', 'Dupont', 'jean.dupont@arcadis.com',
    (SELECT id FROM branches LIMIT 1),
    (SELECT id FROM departments WHERE name = 'Développement' LIMIT 1),
    (SELECT id FROM positions WHERE title = 'Développeur Senior' LIMIT 1),
    '2023-01-15', '2023-01-15', 'active', 'full_time',
    55000, 4.5
),
(
    'EMP002', 'Marie', 'Martin', 'marie.martin@arcadis.com',
    (SELECT id FROM branches LIMIT 1),
    (SELECT id FROM departments WHERE name = 'Marketing' LIMIT 1),
    (SELECT id FROM positions WHERE title = 'Manager Marketing' LIMIT 1),
    '2022-06-10', '2022-06-10', 'active', 'full_time',
    62000, 4.8
),
(
    'EMP003', 'Pierre', 'Durand', 'pierre.durand@arcadis.com',
    (SELECT id FROM branches LIMIT 1),
    (SELECT id FROM departments WHERE name = 'Support Client' LIMIT 1),
    (SELECT id FROM positions WHERE title = 'Agent Support' LIMIT 1),
    '2023-09-01', '2023-09-01', 'active', 'part_time',
    35000, 4.2
),
(
    'EMP004', 'Claire', 'Moreau', 'claire.moreau@arcadis.com',
    (SELECT id FROM branches LIMIT 1),
    (SELECT id FROM departments WHERE name = 'Développement' LIMIT 1),
    (SELECT id FROM positions WHERE title = 'Développeur Senior' LIMIT 1),
    '2024-03-01', '2024-03-01', 'active', 'full_time',
    52000, 4.6
),
(
    'EMP005', 'Thomas', 'Bernard', 'thomas.bernard@arcadis.com',
    (SELECT id FROM branches LIMIT 1),
    (SELECT id FROM departments WHERE name = 'Marketing' LIMIT 1),
    (SELECT id FROM positions WHERE title = 'Agent Support' LIMIT 1),
    '2024-01-15', '2024-01-15', 'active', 'contract',
    42000, 4.0
)
ON CONFLICT (employee_number) DO NOTHING;

-- Mettre à jour les relations hiérarchiques
UPDATE employees 
SET manager_id = (SELECT id FROM employees WHERE employee_number = 'EMP002')
WHERE employee_number IN ('EMP003', 'EMP005');

UPDATE employees 
SET manager_id = (SELECT id FROM employees WHERE employee_number = 'EMP001')
WHERE employee_number = 'EMP004';

-- Mettre à jour les comptes de rapports directs
UPDATE employees 
SET reports_count = (
    SELECT COUNT(*) 
    FROM employees e2 
    WHERE e2.manager_id = employees.id
);

-- Validation finale
SELECT 
    'VALIDATION MODULE RH' as test_name,
    (SELECT COUNT(*) FROM branches) as branches,
    (SELECT COUNT(*) FROM departments) as departments,
    (SELECT COUNT(*) FROM positions) as positions,
    (SELECT COUNT(*) FROM employees) as employees,
    (SELECT COUNT(*) FROM users WHERE role IN ('hr_manager', 'manager')) as hr_users;

-- Afficher les employés créés
SELECT 
    employee_number,
    first_name || ' ' || last_name as full_name,
    work_email,
    d.name as department,
    p.title as position,
    employment_status,
    performance_score,
    manager.first_name || ' ' || manager.last_name as manager_name
FROM employees e
LEFT JOIN departments d ON e.department_id = d.id
LEFT JOIN positions p ON e.position_id = p.id
LEFT JOIN employees manager ON e.manager_id = manager.id
ORDER BY e.employee_number;
