const { db } = require('../config/db');

exports.addCategory = async (req, res) => {
    try {
        if (!req.body || Object.keys(req.body).length === 0) {
            return res.status(400).json({ 
                success: false, 
                message: "No data received." 
            });
        }

        const { category_name, category_status, category_description } = req.body;
        const category_image = req.file ? req.file.path : null;

        if (!category_name) {
            return res.status(400).json({ success: false, message: "Category name is required." });
        }

        const sql = `INSERT INTO categories (category_name, category_status, category_image, category_description) VALUES (?, ?, ?, ?)`;
        const [result] = await db.execute(sql, [
            category_name, 
            category_status || 'active', 
            category_image, 
            category_description || null
        ]);
        
        return res.status(201).json({ 
            success: true,
            message: "Category added successfully!",
            data: { category_id: result.insertId, category_name, category_image }
        });
    } catch (err) {
        return res.status(500).json({ success: false, message: "Database error", error: err.message });
    }
};

exports.getAllCategories = async (req, res) => {
    try {
        const sql = `SELECT * FROM categories ORDER BY category_id DESC`;
        const [rows] = await db.execute(sql);
        return res.status(200).json({ success: true, count: rows.length, data: rows });
    } catch (err) {
        return res.status(500).json({ success: false, error: err.message });
    }
};

exports.updateCategory = async (req, res) => {
    const { id } = req.params;
    const { category_name, category_description, category_status } = req.body;
    const category_image = req.file ? req.file.path : null;

    try {
        // فحص وجود القسم أولاً
        const [cat] = await db.execute('SELECT * FROM categories WHERE category_id = ?', [id]);
        if (cat.length === 0) {
            return res.status(404).json({ success: false, message: "Category not found." });
        }

        // التعديل هنا لضمان عدم حدوث Crash
        const sql = `
            UPDATE categories 
            SET 
                category_name = ?,
                category_description = ?,
                category_status = ?,
                category_image = IFNULL(?, category_image)
            WHERE category_id = ?
        `;

        await db.execute(sql, [
            category_name || cat[0].category_name,
            category_description || cat[0].category_description,
            category_status || cat[0].category_status,
            category_image, // لو null الـ IFNULL هتحافظ على الصورة القديمة
            id
        ]);

        return res.status(200).json({ success: true, message: "Category updated successfully!" });
    } catch (err) {
        console.error("Update Error:", err.message);
        return res.status(500).json({ success: false, message: "Error updating", error: err.message });
    }
};

exports.deleteCategory = async (req, res) => {
    const { id } = req.params;
    try {
        await db.execute(`DELETE FROM categories WHERE category_id = ?`, [id]);
        return res.status(200).json({ success: true, message: "Category deleted successfully!" });
    } catch (err) {
        return res.status(500).json({ success: false, error: err.message });
    }
};