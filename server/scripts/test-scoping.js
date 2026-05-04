/**
 * Smoke test for the multi-teacher scope filter.
 *
 * Doesn't need a database — calls scopingService directly with synthetic
 * user shapes and asserts the returned `where` clauses look right.
 * Catches regressions where a cleanup pass quietly widens the filter.
 *
 * Usage:
 *   node server/scripts/test-scoping.js
 *
 * Exits with code 0 on PASS, 1 on FAIL. Suitable for CI.
 */

import { scopedStudentFilter, scopedClassFilter } from '../src/services/scopingService.js';

let pass = 0;
let fail = 0;
const failures = [];

function assertEqual(label, got, want) {
  const sameJson = JSON.stringify(got) === JSON.stringify(want);
  if (sameJson) {
    pass++;
  } else {
    fail++;
    failures.push(
      `  FAIL: ${label}\n    got:  ${JSON.stringify(got)}\n    want: ${JSON.stringify(want)}`
    );
  }
}

function assertContains(label, obj, key) {
  if (obj && Object.prototype.hasOwnProperty.call(obj, key)) {
    pass++;
  } else {
    fail++;
    failures.push(`  FAIL: ${label} (key "${key}" missing in ${JSON.stringify(obj)})`);
  }
}

// --- Sheikh: filters must be empty objects so they contribute nothing
//     to the surrounding `where`. Anything else is a leak. ---
const sheikh = { id: 'sheikh-id', role: 'admin' };
assertEqual('sheikh studentFilter is empty', scopedStudentFilter(sheikh), {});
assertEqual('sheikh classFilter is empty', scopedClassFilter(sheikh), {});

// --- Teacher: studentFilter must require a TeacherStudent link to
//     this teacher; classFilter must OR own creations with assigned-
//     student attendance. ---
const teacher = { id: 'teacher-id', role: 'teacher' };

const ts = scopedStudentFilter(teacher);
assertContains('teacher studentFilter has `teachers`', ts, 'teachers');
assertEqual(
  'teacher studentFilter requires teacherId match',
  ts,
  { teachers: { some: { teacherId: 'teacher-id' } } }
);

const tc = scopedClassFilter(teacher);
assertContains('teacher classFilter has `OR`', tc, 'OR');
if (Array.isArray(tc.OR) && tc.OR.length === 2) {
  pass++;
  assertEqual(
    'teacher classFilter OR[0] is own creations',
    tc.OR[0],
    { createdByAdminId: 'teacher-id' }
  );
  assertEqual(
    'teacher classFilter OR[1] is assigned-student attendance',
    tc.OR[1],
    {
      assignments: {
        some: {
          student: {
            teachers: { some: { teacherId: 'teacher-id' } },
          },
        },
      },
    }
  );
} else {
  fail++;
  failures.push(`  FAIL: teacher classFilter OR is malformed: ${JSON.stringify(tc)}`);
}

// --- Unknown roles get the most-restrictive filter possible.
//     A `role: 'enrolled_student'` reaching this code is a defensive
//     case (admin-only endpoints already block them via middleware)
//     but the helper should still return a deny-all where clause
//     rather than `{}` (which would be a sheikh-grade open filter). ---
const student = { id: 'student-id', role: 'enrolled_student' };

const ss = scopedStudentFilter(student);
const sc = scopedClassFilter(student);
// scopingService treats anyone non-admin as scoped to their own
// teacher links. An enrolled_student has no `teachers` link to
// themselves, so the filter is effectively deny-all (no rows match).
// This is the right behaviour: defense in depth.
assertContains('non-admin studentFilter is restrictive', ss, 'teachers');
assertContains('non-admin classFilter is restrictive', sc, 'OR');

// --- Output ---
const total = pass + fail;
if (fail > 0) {
  console.error(`scope-filter smoke test: FAIL (${pass}/${total} passed)\n`);
  for (const line of failures) console.error(line);
  process.exit(1);
}
console.log(`scope-filter smoke test: PASS (${pass}/${total} checks)`);
