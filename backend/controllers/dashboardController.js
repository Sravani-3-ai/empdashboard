import { db } from '../db.js';

export const getStats = async (req, res) => {
    const { role, id } = req.query;

    try {
        if (role === 'employee') {
            const results = await Promise.all([
                db.execute({
                    sql: "SELECT COUNT(*) as count FROM attendance WHERE user_id = ? AND date(check_in) = date('now')",
                    args: [id]
                }),
                db.execute({
                    sql: "SELECT COUNT(*) as count FROM leaves WHERE user_id = ? AND status = 'Approved'",
                    args: [id]
                }),
                db.execute({
                    sql: 'SELECT SUM(amount) as total FROM bonuses WHERE user_id = ?',
                    args: [id]
                }),
                db.execute({
                    sql: 'SELECT check_in as date, 8 as count FROM attendance WHERE user_id = ? ORDER BY check_in DESC LIMIT 7',
                    args: [id]
                }),
                db.execute('SELECT COUNT(*) as count FROM users'),
                db.execute("SELECT COUNT(*) as count FROM users WHERE role = 'manager'"),
                db.execute("SELECT COUNT(*) as count FROM users WHERE role = 'admin'")
            ]);

            const [attRes, leaveRes, bonusRes, trendRes, totalUserRes, mgrCountRes, admCountRes] = results;

            return res.status(200).json({
                summary: {
                    totalEmployees: Number(totalUserRes.rows[0]?.count || 0),
                    presentToday: Number(attRes.rows[0]?.count || 0),
                    onLeaveToday: Number(leaveRes.rows[0]?.count || 0),
                    totalBonuses: Number(bonusRes.rows[0]?.total || 0),
                    managerCount: Number(mgrCountRes.rows[0]?.count || 0),
                    adminCount: Number(admCountRes.rows[0]?.count || 0),
                },
                attendanceStats: trendRes.rows.reverse(),
                leaveStats: { 'Approved': Number(leaveRes.rows[0]?.count || 0) }
            });
        }

        // Admin or Manager
        const [totalUserRes, presentRes, leaveRes, bonusRes, mgrCountRes, admCountRes, trendRes] = await Promise.all([
            db.execute('SELECT COUNT(*) as count FROM users'),
            db.execute("SELECT COUNT(*) as count FROM attendance WHERE date(check_in) = date('now')"),
            db.execute("SELECT COUNT(*) as count FROM leaves WHERE date('now') BETWEEN date(from_date) AND date(to_date)"),
            db.execute('SELECT SUM(amount) as total FROM bonuses'),
            db.execute("SELECT COUNT(*) as count FROM users WHERE role = 'manager'"),
            db.execute("SELECT COUNT(*) as count FROM users WHERE role = 'admin'"),
            db.execute('SELECT date(check_in) as date, COUNT(*) as count FROM attendance GROUP BY date(check_in) ORDER BY date DESC LIMIT 7')
        ]);

        res.status(200).json({
            summary: {
                totalEmployees: Number(totalUserRes.rows[0]?.count || 0),
                presentToday: Number(presentRes.rows[0]?.count || 0),
                onLeaveToday: Number(leaveRes.rows[0]?.count || 0),
                totalBonuses: Number(bonusRes.rows[0]?.total || 0),
                managerCount: Number(mgrCountRes.rows[0]?.count || 0),
                adminCount: Number(admCountRes.rows[0]?.count || 0),
            },
            attendanceStats: trendRes.rows.reverse(),
            leaveStats: { 'On Leave': Number(leaveRes.rows[0]?.count || 0) }
        });
    } catch (error) {
        console.error('Dashboard Stats Error:', error);
        res.status(500).json({ message: 'Error fetching stats', error: error.message });
    }
};
