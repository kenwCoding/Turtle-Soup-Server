export async function createUser(req: any, email: string, image_url: string, user_profile: any) {
  const pg = req.pool;

  // Upsert user
  const user = await pg.query(`
    INSERT INTO
      users (email, image_url, user_profile)
    VALUES
      ($1, $2, $3)
    ON CONFLICT
      (email)
    DO UPDATE SET
      image_url = $2,
      user_profile = $3,
      updated_at = now()
    RETURNING *,
     (xmax = 0) AS is_created
  `, [email, image_url, JSON.stringify(user_profile)]);

  return user.rows[0];
}