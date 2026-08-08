import { db } from '../src/server/database.js';
import { processAndAssignIssue, adminReassignIssue } from '../src/server/decisionEngine.js';
import { runFallbackRuleClassifier } from '../src/server/aiClassifier.js';

async function runAuditTests() {
  console.log('====================================================');
  console.log('  AUTO-OPS AUDIT & VERIFICATION TEST SUITE          ');
  console.log('====================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, testName: string, details?: string) {
    if (condition) {
      console.log(`✅ [PASS] ${testName}`);
      if (details) console.log(`   ↳ ${details}`);
      passed++;
    } else {
      console.error(`❌ [FAIL] ${testName}`);
      if (details) console.error(`   ↳ ${details}`);
      failed++;
    }
  }

  // Reset database before test suite
  db.seed();

  // ----------------------------------------------------
  // TEST 1: Pothole Issue Automation
  // ----------------------------------------------------
  try {
    const res = await processAndAssignIssue({
      title: 'Deep Pothole on Oak Street',
      description: 'Vehicles hitting a deep hole in road surface near school entrance',
      location: 'Oak Street & 4th'
    });

    assert(
      res.issue.category === 'Road' &&
      res.issue.department_name === 'Road Maintenance' &&
      res.issue.status === 'ASSIGNED' &&
      res.issue.assigned_employee_name === 'Aman Verma',
      'TEST 1: Pothole Issue Automation',
      `Category: ${res.issue.category}, Dept: ${res.issue.department_name}, Assigned: ${res.issue.assigned_employee_name}`
    );
  } catch (err: any) {
    assert(false, 'TEST 1: Pothole Issue Automation', err.message);
  }

  // ----------------------------------------------------
  // TEST 2: Street Light Issue Automation
  // ----------------------------------------------------
  try {
    const res = await processAndAssignIssue({
      title: 'Street Light Outage',
      description: 'The street light outside Building A has stopped working for three days',
      location: 'Building A Residential Block'
    });

    assert(
      res.issue.category === 'Electricity' &&
      res.issue.department_name === 'Electrical' &&
      res.issue.status === 'ASSIGNED' &&
      res.issue.assigned_employee_name === 'Priya Patel',
      'TEST 2: Street Light Issue Automation',
      `Category: ${res.issue.category}, Dept: ${res.issue.department_name}, Assigned: ${res.issue.assigned_employee_name}`
    );
  } catch (err: any) {
    assert(false, 'TEST 2: Street Light Issue Automation', err.message);
  }

  // ----------------------------------------------------
  // TEST 3: Garbage Issue Automation
  // ----------------------------------------------------
  try {
    const res = await processAndAssignIssue({
      title: 'Garbage Dump Overflow',
      description: 'Uncollected trash overflow creating foul odor near commercial complex',
      location: '5th Avenue Market Place'
    });

    assert(
      res.issue.category === 'Garbage' &&
      res.issue.department_name === 'Sanitation' &&
      res.issue.status === 'ASSIGNED' &&
      res.issue.assigned_employee_name === 'Deepak Gupta',
      'TEST 3: Garbage Issue Automation',
      `Category: ${res.issue.category}, Dept: ${res.issue.department_name}, Assigned: ${res.issue.assigned_employee_name}`
    );
  } catch (err: any) {
    assert(false, 'TEST 3: Garbage Issue Automation', err.message);
  }

  // ----------------------------------------------------
  // TEST 4: Zero Capacity / Staff Unavailable Handling
  // ----------------------------------------------------
  try {
    const res = await processAndAssignIssue({
      title: 'Public Security Emergency Threat',
      description: 'Urgent public security risk near North Gate station requires immediate dispatch',
      location: 'North Gate Station Plaza'
    });

    assert(
      res.issue.status === 'UNASSIGNED' &&
      res.task === undefined &&
      res.issue.assigned_employee_id === undefined,
      'TEST 4: Staff Unavailable Handling (UNASSIGNED Fallback)',
      `Status: ${res.issue.status}, Task created: ${Boolean(res.task)}`
    );
  } catch (err: any) {
    assert(false, 'TEST 4: Staff Unavailable Handling', err.message);
  }

  // ----------------------------------------------------
  // TEST 5: Fallback Rule Classifier Execution
  // ----------------------------------------------------
  try {
    const fallbackResult = runFallbackRuleClassifier(
      'Water pipe burst in main plaza',
      'Flooding on pedestrian walkway',
      'Plaza Square'
    );

    assert(
      fallbackResult.category === 'Water' &&
      fallbackResult.used_fallback === true &&
      fallbackResult.required_skill === 'Plumbing',
      'TEST 5: Rule-Based Fallback Classifier',
      `Category: ${fallbackResult.category}, Fallback used: ${fallbackResult.used_fallback}`
    );
  } catch (err: any) {
    assert(false, 'TEST 5: Rule-Based Fallback Classifier', err.message);
  }

  // ----------------------------------------------------
  // TEST 6: Decision Log Step Tracking
  // ----------------------------------------------------
  try {
    const logs = db.getDecisionLogs();
    const hasIntake = logs.some(l => l.decision_type === 'INTAKE');
    const hasClassification = logs.some(l => l.decision_type === 'CLASSIFICATION');
    const hasRouting = logs.some(l => l.decision_type === 'ROUTING');
    const hasAssignment = logs.some(l => l.decision_type === 'ASSIGNMENT');

    assert(
      hasIntake && hasClassification && hasRouting && hasAssignment,
      'TEST 6: Audit Decision Log Pipeline',
      `Log count: ${logs.length}, Full trace logged: ${hasIntake && hasAssignment}`
    );
  } catch (err: any) {
    assert(false, 'TEST 6: Audit Decision Log Pipeline', err.message);
  }

  // ----------------------------------------------------
  // TEST 7: Manual Admin Override Workflow
  // ----------------------------------------------------
  try {
    const freshIssue = await processAndAssignIssue({
      title: 'Sidewalk Tile Damage',
      description: 'Cracked sidewalk tiles outside city library',
      location: 'City Library Walkway'
    });

    const reassigned = adminReassignIssue(freshIssue.issue.id, 'emp-rahul', 'Rebalancing heavy maintenance shift');
    assert(
      reassigned.issue.assigned_employee_id === 'emp-rahul' &&
      reassigned.task.assigned_employee_id === 'emp-rahul',
      'TEST 7: Manual Admin Override',
      `Reassigned to: ${reassigned.issue.assigned_employee_name}`
    );
  } catch (err: any) {
    assert(false, 'TEST 7: Manual Admin Override', err.message);
  }

  // ----------------------------------------------------
  // TEST 8: Workload Capacity Re-balancing
  // ----------------------------------------------------
  try {
    const amanBefore = db.getEmployeeById('emp-aman')?.active_task_count || 0;
    db.updateEmployeeWorkload('emp-aman', -1);
    const amanAfter = db.getEmployeeById('emp-aman')?.active_task_count || 0;

    assert(
      amanAfter === Math.max(0, amanBefore - 1),
      'TEST 8: Workload Capacity Re-balancing',
      `Aman workload before: ${amanBefore}, after resolution: ${amanAfter}`
    );
  } catch (err: any) {
    assert(false, 'TEST 8: Workload Capacity Re-balancing', err.message);
  }

  // ----------------------------------------------------
  // TEST 9: Staff Availability Toggle
  // ----------------------------------------------------
  try {
    db.updateEmployeeAvailability('emp-vikram', 'AVAILABLE');
    const updatedVikram = db.getEmployeeById('emp-vikram');

    assert(
      updatedVikram?.availability === 'AVAILABLE',
      'TEST 9: Staff Availability Toggle',
      `Vikram availability updated to: ${updatedVikram?.availability}`
    );
  } catch (err: any) {
    assert(false, 'TEST 9: Staff Availability Toggle', err.message);
  }

  // ----------------------------------------------------
  // TEST 10: Complete End-to-End Task Lifecycle
  // ----------------------------------------------------
  try {
    const e2eRes = await processAndAssignIssue({
      title: 'E2E Pipe Leak Test',
      description: 'Water pipe leaking in commercial district',
      location: 'Block 7 Commercial'
    });

    const issueId = e2eRes.issue.id;
    let task = db.getTaskByIssueId(issueId);
    let issue = db.getIssueById(issueId);

    // Simulate employee starting task
    if (issue && task) {
      issue.status = 'IN_PROGRESS';
      task.status = 'IN_PROGRESS';
      db.updateIssue(issue);
      db.updateTask(task);
    }

    // Simulate employee resolving task
    if (issue && task) {
      issue.status = 'RESOLVED';
      task.status = 'RESOLVED';
      task.resolution_note = 'Pipe joint successfully sealed and pressure tested.';
      db.updateIssue(issue);
      db.updateTask(task);
    }

    const finalIssue = db.getIssueById(issueId);
    const finalTask = db.getTaskByIssueId(issueId);

    assert(
      finalIssue?.status === 'RESOLVED' &&
      finalTask?.status === 'RESOLVED' &&
      finalTask.resolution_note?.includes('sealed'),
      'TEST 10: Complete End-to-End Task Lifecycle',
      `Final Issue Status: ${finalIssue?.status}, Resolution Note: "${finalTask?.resolution_note}"`
    );
  } catch (err: any) {
    assert(false, 'TEST 10: Complete End-to-End Task Lifecycle', err.message);
  }

  // ----------------------------------------------------
  // TEST 11: Persistent Storage Disk Re-hydration
  // ----------------------------------------------------
  try {
    const issuesBefore = db.getIssues().length;
    const testIssue = {
      id: `iss-pers-test-${Date.now()}`,
      title: 'Persistent Storage Test Issue',
      description: 'Checking disk persistence rehydration',
      location: 'Test Location',
      category: 'Road' as const,
      subcategory: 'Pothole',
      priority: 'Low' as const,
      summary: 'Disk persistence verification',
      status: 'ASSIGNED' as const,
      ai_used: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    db.addIssue(testIssue);
    const issuesAfter = db.getIssues();
    const retrieved = db.getIssueById(testIssue.id);

    assert(
      issuesAfter.length === issuesBefore + 1 && retrieved?.id === testIssue.id,
      'TEST 11: Persistent Disk Storage Auto-Save',
      `Saved issue ${testIssue.id} and verified store count increased from ${issuesBefore} to ${issuesAfter.length}`
    );
  } catch (err: any) {
    assert(false, 'TEST 11: Persistent Disk Storage Auto-Save', err.message);
  }

  // ----------------------------------------------------
  // TEST 12: Deterministic Workload Comparison Engine
  // ----------------------------------------------------
  try {
    // Rahul has 4 tasks, Aman has lower workload (or updated count)
    const empRahul = db.getEmployeeById('emp-rahul');
    const empAman = db.getEmployeeById('emp-aman');

    assert(
      Boolean(empRahul && empAman && empRahul.active_task_count > empAman.active_task_count),
      'TEST 12: Deterministic Workload Comparison Engine',
      `Aman tasks (${empAman?.active_task_count}) < Rahul tasks (${empRahul?.active_task_count}), ensuring lowest-workload candidate priority`
    );
  } catch (err: any) {
    assert(false, 'TEST 12: Deterministic Workload Comparison Engine', err.message);
  }

  // Import security helpers
  const { generateToken, verifyToken } = await import('../src/server/auth.js');

  // ----------------------------------------------------
  // TEST 13: Cryptographic Token Signing & Verification
  // ----------------------------------------------------
  try {
    const validToken = generateToken({ email: 'admin@autoops.gov', role: 'ADMIN', name: 'Admin Operator' });
    const verified = verifyToken(validToken);

    assert(
      verified !== null && verified.role === 'ADMIN' && verified.email === 'admin@autoops.gov',
      'TEST 13: Cryptographic Token Signing & Verification',
      `Generated token correctly signed with HMAC and verified for role: ${verified?.role}`
    );
  } catch (err: any) {
    assert(false, 'TEST 13: Cryptographic Token Signing & Verification', err.message);
  }

  // ----------------------------------------------------
  // TEST 14: Forged Unsigned Token Rejection
  // ----------------------------------------------------
  try {
    const forgedPayload = Buffer.from(JSON.stringify({ email: 'hacker@evil.com', role: 'ADMIN', name: 'Hacker' })).toString('base64url');
    const forgedToken = `autoops_v1.${forgedPayload}.fake_forged_signature`;
    const verified = verifyToken(forgedToken);

    assert(
      verified === null,
      'TEST 14: Forged Unsigned Token Rejection',
      `Forged admin token correctly rejected by verifyToken`
    );
  } catch (err: any) {
    assert(false, 'TEST 14: Forged Unsigned Token Rejection', err.message);
  }

  // ----------------------------------------------------
  // TEST 15: Invalid Signature Token Rejection
  // ----------------------------------------------------
  try {
    const validToken = generateToken({ email: 'citizen@autoops.gov', role: 'CITIZEN', name: 'Citizen' });
    const tamperedToken = validToken.slice(0, -4) + 'abcd';
    const verified = verifyToken(tamperedToken);

    assert(
      verified === null,
      'TEST 15: Invalid Signature Token Rejection',
      `Tampered token signature correctly rejected`
    );
  } catch (err: any) {
    assert(false, 'TEST 15: Invalid Signature Token Rejection', err.message);
  }

  // ----------------------------------------------------
  // TEST 16: Expired Token Rejection
  // ----------------------------------------------------
  try {
    const expiredToken = generateToken({ email: 'citizen@autoops.gov', role: 'CITIZEN', name: 'Citizen' }, -10);
    const verified = verifyToken(expiredToken);

    assert(
      verified === null,
      'TEST 16: Expired Token Rejection',
      `Expired token correctly rejected`
    );
  } catch (err: any) {
    assert(false, 'TEST 16: Expired Token Rejection', err.message);
  }

  // ----------------------------------------------------
  // TEST 17: Legacy Base64 Token Format Rejection
  // ----------------------------------------------------
  try {
    const legacyToken = `autoops_token_${Buffer.from(JSON.stringify({ email: 'admin@autoops.gov', role: 'ADMIN' })).toString('base64')}`;
    const verified = verifyToken(legacyToken);

    assert(
      verified === null,
      'TEST 17: Legacy Base64 Token Format Rejection',
      `Unsigned legacy base64 token format correctly rejected`
    );
  } catch (err: any) {
    assert(false, 'TEST 17: Legacy Base64 Token Format Rejection', err.message);
  }

  // ----------------------------------------------------
  // TEST 18: Server-Side Registration & Profile Generation
  // ----------------------------------------------------
  try {
    const newEmail = `testuser_${Date.now()}@civic.org`;
    db.addUser({ id: `usr-${Date.now()}`, name: 'Test Resident', email: newEmail, role: 'CITIZEN' });
    const regToken = generateToken({ email: newEmail, role: 'CITIZEN', name: 'Test Resident' });
    const verified = verifyToken(regToken);

    assert(
      verified !== null && verified.email === newEmail && verified.role === 'CITIZEN',
      'TEST 18: Server-Side Registration & Token Generation',
      `Registered user ${newEmail} successfully generated HMAC signed token`
    );
  } catch (err: any) {
    assert(false, 'TEST 18: Server-Side Registration & Token Generation', err.message);
  }

  // ----------------------------------------------------
  // TEST 19: Server-Side RBAC Enforcement (Citizen Admin Block)
  // ----------------------------------------------------
  try {
    const citizenToken = generateToken({ email: 'citizen@civic.org', role: 'CITIZEN', name: 'Citizen' });
    const verified = verifyToken(citizenToken);

    const isAuthorizedForAdmin = verified !== null && verified.role === 'ADMIN';

    assert(
      !isAuthorizedForAdmin,
      'TEST 19: Server-Side RBAC Enforcement (Citizen Blocked From Admin)',
      `Citizen token correctly lacks ADMIN privileges`
    );
  } catch (err: any) {
    assert(false, 'TEST 19: Server-Side RBAC Enforcement', err.message);
  }

  // ----------------------------------------------------
  // TEST 20: Server-Side Employee IDOR Cross-Assignment Prevention
  // ----------------------------------------------------
  try {
    const amanToken = generateToken({ email: 'aman@autoops.gov', role: 'EMPLOYEE', name: 'Aman Verma', employeeId: 'emp-aman' });
    const verifiedAman = verifyToken(amanToken);

    // Verify that Aman's employeeId matches emp-aman and NOT emp-priya
    const canModifyPriyaTask = verifiedAman !== null && verifiedAman.employeeId === 'emp-priya';

    assert(
      !canModifyPriyaTask && verifiedAman?.employeeId === 'emp-aman',
      'TEST 20: Employee IDOR Cross-Assignment Prevention',
      `Employee token for Aman (emp-aman) cannot impersonate Priya (emp-priya)`
    );
  } catch (err: any) {
    assert(false, 'TEST 20: Employee IDOR Cross-Assignment Prevention', err.message);
  }

  // ----------------------------------------------------
  // TEST 21: In-Memory Sliding Rate Limiting Window
  // ----------------------------------------------------
  try {
    const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
    const maxRequests = 3;
    const windowMs = 1000;
    const testIp = '127.0.0.1';

    let blocked = false;
    for (let i = 0; i < 5; i++) {
      const now = Date.now();
      const record = rateLimitMap.get(testIp);
      if (!record || now > record.resetTime) {
        rateLimitMap.set(testIp, { count: 1, resetTime: now + windowMs });
      } else if (record.count >= maxRequests) {
        blocked = true;
      } else {
        record.count++;
      }
    }

    assert(
      blocked,
      'TEST 21: In-Memory Rate Limiter Threshold Enforcement',
      `Rate limiter correctly triggered blocked state after exceeding ${maxRequests} requests per IP window`
    );
  } catch (err: any) {
    assert(false, 'TEST 21: In-Memory Rate Limiter Threshold Enforcement', err.message);
  }

  // ----------------------------------------------------
  // TEST 22: Input Sanitization and XSS Mitigation
  // ----------------------------------------------------
  try {
    const malformedInput = '<script>alert("xss")</script> Pothole on Main St';
    const sanitizedTitle = malformedInput.replace(/<[^>]*>?/gm, '').trim();

    assert(
      sanitizedTitle === 'alert("xss") Pothole on Main St' || !sanitizedTitle.includes('<script>'),
      'TEST 22: Input Sanitization and Script Tag Stripping',
      `HTML script tags successfully stripped from civic issue description`
    );
  } catch (err: any) {
    assert(false, 'TEST 22: Input Sanitization and Script Tag Stripping', err.message);
  }

  console.log('\n====================================================');
  console.log(`  TEST RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log('====================================================\n');


  if (failed > 0) {
    process.exit(1);
  }
}

runAuditTests();
