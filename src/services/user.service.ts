export async function createUser(req: any, email: string, image_url: string, user_profile: any) {
  const pg = req.pool;

  // Ensure user_profile is stored as JSON
  const profileData = typeof user_profile === 'string' 
    ? user_profile 
    : JSON.stringify(user_profile);

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
  `, [email, image_url, profileData]);

  return user.rows[0];
}

export async function getUser(req: any, email: string) {
  const pg = req.pool;
  const user = await pg.query(`
    SELECT * FROM users WHERE email = $1
  `, [email]);
  return user.rows[0];
}