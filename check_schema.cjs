
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://brebvinutztbawpcnxzh.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJyZWJ2aW51dHp0YmF3cGNueHpoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU0ODM3NjUsImV4cCI6MjA4MTA1OTc2NX0.h5UgVx1cnzMmv9DI6G320l3id6aqIltl_4nrQLjmsFI';
const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
    console.log('Checking perfis columns...');
    const { data, error } = await supabase.from('perfis').select('*').limit(1);

    if (error) {
        console.error('Error selecting from perfis:', error);
    } else {
        if (data && data.length > 0) {
            console.log('Columns found:', Object.keys(data[0]).join(', '));
        } else {
            console.log('Table perfis is empty, trying to insert dummy to check schema is harder without access to info_schema. Just assuming standard for now.');
            // I'll try to select 'password' specifically
            const { error: colError } = await supabase.from('perfis').select('password').limit(1);
            if (colError) {
                console.log('Column password likely does NOT exist:', colError.message);
            } else {
                console.log('Column password verified to exist (or at least queryable).');
            }
        }
    }
}

check();
