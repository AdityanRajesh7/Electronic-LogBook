"use strict";
var __makeTemplateObject = (this && this.__makeTemplateObject) || function (cooked, raw) {
    if (Object.defineProperty) { Object.defineProperty(cooked, "raw", { value: raw }); } else { cooked.raw = raw; }
    return cooked;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var db_1 = require("@workspace/db");
var drizzle_orm_1 = require("drizzle-orm");
var bcryptjs_1 = __importDefault(require("bcryptjs"));
var drizzle_orm_2 = require("drizzle-orm");
function main() {
    return __awaiter(this, void 0, void 0, function () {
        var users, _i, users_1, u, cases, procedures, academics, depts, deptId, aravind, hash, resUser, regNo, joinDate, kuhsId;
        var _a, _b, _c;
        return __generator(this, function (_d) {
            switch (_d.label) {
                case 0:
                    console.log("Starting Phase 0 Checks...");
                    return [4 /*yield*/, db_1.db.select({
                            id: db_1.usersTable.id,
                            fullName: db_1.usersTable.fullName,
                            studentId: db_1.studentsTable.id
                        }).from(db_1.usersTable)
                            .innerJoin(db_1.studentsTable, (0, drizzle_orm_1.eq)(db_1.usersTable.id, db_1.studentsTable.userId))
                            .where((0, drizzle_orm_2.sql)(templateObject_1 || (templateObject_1 = __makeTemplateObject(["", " = 'student' AND ", " ILIKE '%Anil%'"], ["", " = 'student' AND ", " ILIKE '%Anil%'"])), db_1.usersTable.role, db_1.usersTable.fullName))];
                case 1:
                    users = _d.sent();
                    if (!(users.length === 0)) return [3 /*break*/, 2];
                    console.log("No student named Anil Kumar found.");
                    return [3 /*break*/, 8];
                case 2:
                    _i = 0, users_1 = users;
                    _d.label = 3;
                case 3:
                    if (!(_i < users_1.length)) return [3 /*break*/, 8];
                    u = users_1[_i];
                    console.log("Found user: id=".concat(u.id, ", fullName=").concat(u.fullName, ", studentId=").concat(u.studentId));
                    return [4 /*yield*/, db_1.db.execute((0, drizzle_orm_2.sql)(templateObject_2 || (templateObject_2 = __makeTemplateObject(["SELECT count(*) FROM case_logs WHERE student_id = ", ""], ["SELECT count(*) FROM case_logs WHERE student_id = ", ""])), u.studentId))];
                case 4:
                    cases = _d.sent();
                    return [4 /*yield*/, db_1.db.execute((0, drizzle_orm_2.sql)(templateObject_3 || (templateObject_3 = __makeTemplateObject(["SELECT count(*) FROM procedure_logs WHERE student_id = ", ""], ["SELECT count(*) FROM procedure_logs WHERE student_id = ", ""])), u.studentId))];
                case 5:
                    procedures = _d.sent();
                    return [4 /*yield*/, db_1.db.execute((0, drizzle_orm_2.sql)(templateObject_4 || (templateObject_4 = __makeTemplateObject(["SELECT count(*) FROM academic_logs WHERE student_id = ", ""], ["SELECT count(*) FROM academic_logs WHERE student_id = ", ""])), u.studentId))];
                case 6:
                    academics = _d.sent();
                    console.log("Logs for studentId ".concat(u.studentId, ":"));
                    console.log("- Cases: ".concat((_a = cases[0]) === null || _a === void 0 ? void 0 : _a.count));
                    console.log("- Procedures: ".concat((_b = procedures[0]) === null || _b === void 0 ? void 0 : _b.count));
                    console.log("- Academics: ".concat((_c = academics[0]) === null || _c === void 0 ? void 0 : _c.count));
                    _d.label = 7;
                case 7:
                    _i++;
                    return [3 /*break*/, 3];
                case 8: return [4 /*yield*/, db_1.db.execute((0, drizzle_orm_2.sql)(templateObject_5 || (templateObject_5 = __makeTemplateObject(["SELECT id FROM departments WHERE code = 'PAED' LIMIT 1"], ["SELECT id FROM departments WHERE code = 'PAED' LIMIT 1"]))))];
                case 9:
                    depts = _d.sent();
                    if (!(depts.length > 0)) return [3 /*break*/, 15];
                    deptId = depts[0].id;
                    return [4 /*yield*/, db_1.db.select().from(db_1.usersTable).where((0, drizzle_orm_1.eq)(db_1.usersTable.email, 'aravind@elogbook.com'))];
                case 10:
                    aravind = _d.sent();
                    if (!(aravind.length === 0)) return [3 /*break*/, 14];
                    return [4 /*yield*/, bcryptjs_1.default.hash('password123', 10)];
                case 11:
                    hash = _d.sent();
                    return [4 /*yield*/, db_1.db.insert(db_1.usersTable).values({
                            fullName: 'Aravind P',
                            email: 'aravind@elogbook.com',
                            passwordHash: hash,
                            role: 'student',
                            status: 'approved',
                            departmentId: deptId
                        }).returning({ id: db_1.usersTable.id })];
                case 12:
                    resUser = (_d.sent())[0];
                    regNo = 'PG2024-PAED-' + Math.floor(100 + Math.random() * 900);
                    joinDate = '2024-06-01';
                    kuhsId = 'KUHS-' + regNo;
                    return [4 /*yield*/, db_1.db.insert(db_1.studentsTable).values({
                            userId: resUser.id,
                            registrationNumber: regNo,
                            batch: '2024',
                            dateOfJoining: joinDate,
                            kuhsId: kuhsId,
                            specialty: 'Pediatrics'
                        })];
                case 13:
                    _d.sent();
                    console.log("Created student Aravind P.");
                    console.log("Credentials: email: aravind@elogbook.com, password: password123");
                    console.log("Details: Registration: ".concat(regNo, ", Join Date: ").concat(joinDate));
                    return [3 /*break*/, 15];
                case 14:
                    console.log('Aravind P already exists.');
                    _d.label = 15;
                case 15:
                    process.exit(0);
                    return [2 /*return*/];
            }
        });
    });
}
main().catch(console.error);
var templateObject_1, templateObject_2, templateObject_3, templateObject_4, templateObject_5;
