// File: app/page.tsx
import { neon } from '@neondatabase/serverless';

export default function dbtest() {
  async function create(formData: FormData) {
    'use server';
    // Connect to the Neon database
    const sql = neon(`${process.env.DATABASE_URL}`);
    const comment = formData.get('comment');
    const comment2 = formData.get('comment2');
    // Insert the comment from the form into the Postgres database
    await sql('INSERT INTO comments (comment) VALUES ($1) ($2)', [comment, comment2]);
  }

  return (
    <form action={create}>
      <input type="text" placeholder="write a comment" name="comment" />
      <input type="text" placeholder="write a comment2" name="comment2" />
      <button type="submit">Submit</button>
    </form>
  );
}