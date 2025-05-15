const db = require('./db');
(async () => {
  try {
    const pollRes = await db.query('SELECT * FROM polls WHERE id=$1', ['age']);
    if (pollRes.rows.length === 0) {
      await db.query(
        'INSERT INTO polls (id, question, options) VALUES ($1, $2, $3)',
        ['age', 'What is your age?', ['20-30', '30-40', '40-50', '50+']]
      );
      console.log("Created global 'age' poll");
    } else {
      console.log("Global 'age' poll already exists");
    }
    process.exit(0);
  } catch (err) {
    console.error('Failed to ensure global age poll:', err);
    process.exit(1);
  }
})();
