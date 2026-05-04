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
const sheikh = { id: 'sheikh-id', role: 'admin', isTeacher: false };
assertEqual('sheikh studentFilter is empty', scopedStudentFilter(sheikh), {});
assertEqual('sheikh classFilter is empty', scopedClassFilter(sheikh), {});

// --- Sheikh-with-isTeacher (defensive case if anyone ever sets it):
//     should still bypass the scope. Admin role wins. ---
const sheikhTeacher = { id: 'sheikh-id', role: 'admin', isTeacher: true };
assertEqual('admin+isTeacher studentFilter is empty', scopedStudentFilter(sheikhTeacher), {});
assertEqual('admin+isTeacher classFilter is empty', scopedClassFilter(sheikhTeacher), {});

// --- Pure teacher (legacy shape, role=teacher pre-migration):
//     should now FAIL the capability check and return deny-all,
//     because role='teacher' is deprecated and isTeacher must be the
//     source of truth. Defense against forgotten migrations. ---
const legacyTeacher = { id: 'legacy-id', role: 'teacher', isTeacher: false };
const legStu = scopedStudentFilter(legacyTeacher);
const legCls = scopedClassFilter(legacyTeacher);
assertContains('legacy role=teacher (no flag) studentFilter is deny-all', legStu, 'id');
assertContains('legacy role=teacher (no flag) classFilter is deny-all', legCls, 'id');

// --- Capability teacher: enrolled_student + isTeacher=true (the new
//     model). studentFilter must require a TeacherStudent link to
//     this teacher; classFilter must OR own creations with assigned-
//     student attendance. ---
const teacher = { id: 'teacher-id', role: 'enrolled_student', isTeacher: true };

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

// --- Pure enrolled_student (no teacher capability): deny-all on both
//     filters. They shouldn't reach admin routes anyway, but defense
//     in depth in case middleware regresses. ---
const student = { id: 'student-id', role: 'enrolled_student', isTeacher: false };
assertContains('student studentFilter is deny-all', scopedStudentFilter(student), 'id');
assertContains('student classFilter is deny-all', scopedClassFilter(student), 'id');

// --- Output ---
const total = pass + fail;
if (fail > 0) {
  console.error(`scope-filter smoke test: FAIL (${pass}/${total} passed)\n`);
  for (const line of failures) console.error(line);
  process.exit(1);
}
console.log(`scope-filter smoke test: PASS (${pass}/${total} checks)`);
