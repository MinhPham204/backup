const dbConfig = require('../config/dbconfig');
const express = require('express');
const router = express.Router();
const sql = require('mssql');

// Lấy danh sách lớp học
router.get('/', async (req, res) => {
    try {
        const pool = new sql.ConnectionPool(dbConfig);
        const poolConnect = pool.connect();
        await poolConnect;
        const request = pool.request();
        const result = await request.query`
            SELECT DISTINCT c.Id, c.ClassName
            FROM Class c
            INNER JOIN Students s ON s.ClassId = c.Id
            ORDER BY c.ClassName
        `;
        res.json(result.recordset);
    } catch (error) {
        console.error('Lỗi khi lấy danh sách lớp:', error);
        res.status(500).json({ error: 'Lỗi server', message: error.message });
    }
});

// Lấy danh sách môn học
router.get('/', async (req, res) => {
    try {
        const result = await sql.query`
            SELECT DISTINCT s.Id, s.SubjectCode, s.SubjectName
            FROM Subjects s
            INNER JOIN Projects p ON p.SubjectId = s.Id
            ORDER BY s.SubjectCode
        `;
        res.json(result.recordset);
    } catch (error) {
        console.error('Lỗi khi lấy danh sách môn học:', error);
        res.status(500).json({ error: 'Lỗi server', message: error.message });
    }
});

// Lấy danh sách nhóm
router.get('/', async (req, res) => {
    try {
        const { classId, subjectId } = req.query;
        console.log('Đang lấy danh sách nhóm với classId:', classId, 'subjectId:', subjectId);

        const result = await sql.query`
            SELECT 
                sg.Id as groupId,
                sg.GroupName,
                sg.Notes as description,
                sg.GroupStatus as status,
                sg.PresentationDate as createdAt,
                sg.TotalMember as memberCount,
                p.Id as projectId,
                p.ProjectName,
                p.Description as projectDescription,
                p.Deadline as projectDeadline,
                c.ClassName,
                s.SubjectCode,
                s.SubjectName
            FROM StudentGroups sg
            LEFT JOIN Projects p ON p.Id = sg.ProjectId
            LEFT JOIN GroupMembers gm ON gm.GroupId = sg.Id
            LEFT JOIN Students st ON st.Id = gm.StudentId
            LEFT JOIN Class c ON c.Id = st.ClassId
            LEFT JOIN Subjects s ON s.Id = p.SubjectId
            WHERE (@classId IS NULL OR st.ClassId = @classId)
            AND (@subjectId IS NULL OR p.SubjectId = @subjectId)
            GROUP BY 
                sg.Id, sg.GroupName, sg.Notes, sg.GroupStatus, 
                sg.PresentationDate, sg.TotalMember, p.Id, p.ProjectName,
                p.Description, p.Deadline, c.ClassName, s.SubjectCode, s.SubjectName
            ORDER BY sg.PresentationDate DESC
        `;

        console.log('Tìm thấy', result.recordset.length, 'nhóm');
        res.json(result.recordset);
    } catch (error) {
        console.error('Lỗi khi lấy danh sách nhóm:', error);
        res.status(500).json({ error: 'Lỗi server', message: error.message });
    }
});

// Lấy chi tiết nhóm
router.get('/', async (req, res) => {
    try {
        const { groupId } = req.params;
        console.log('Đang lấy chi tiết nhóm:', groupId);

        // Lấy thông tin nhóm
        const groupResult = await sql.query`
            SELECT 
                sg.Id as groupId,
                sg.GroupName,
                sg.Notes as description,
                sg.GroupStatus as status,
                sg.PresentationDate as createdAt,
                sg.TotalMember as memberCount,
                p.Id as projectId,
                p.ProjectName,
                p.Description as projectDescription,
                p.Deadline as projectDeadline,
                c.ClassName,
                s.SubjectCode,
                s.SubjectName
            FROM StudentGroups sg
            LEFT JOIN Projects p ON p.Id = sg.ProjectId
            LEFT JOIN GroupMembers gm ON gm.GroupId = sg.Id
            LEFT JOIN Students st ON st.Id = gm.StudentId
            LEFT JOIN Class c ON c.Id = st.ClassId
            LEFT JOIN Subjects s ON s.Id = p.SubjectId
            WHERE sg.Id = @groupId
            GROUP BY 
                sg.Id, sg.GroupName, sg.Notes, sg.GroupStatus, 
                sg.PresentationDate, sg.TotalMember, p.Id, p.ProjectName,
                p.Description, p.Deadline, c.ClassName, s.SubjectCode, s.SubjectName
        `;

        if (groupResult.recordset.length === 0) {
            return res.status(404).json({ error: 'Không tìm thấy nhóm' });
        }

        const group = groupResult.recordset[0];

        // Lấy danh sách thành viên
        const membersResult = await sql.query`
            SELECT 
                s.Id as studentId,
                s.StudentCode,
                s.FullName,
                gm.Role,
                gm.Score,
                gm.Notes,
                gm.Id as joinOrder
            FROM GroupMembers gm
            INNER JOIN Students s ON s.Id = gm.StudentId
            WHERE gm.GroupId = @groupId
            ORDER BY gm.Id
        `;

        group.members = membersResult.recordset;
        res.json(group);
    } catch (error) {
        console.error('Lỗi khi lấy chi tiết nhóm:', error);
        res.status(500).json({ error: 'Lỗi server', message: error.message });
    }
});

module.exports = router; 