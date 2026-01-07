import { supabase } from './utils/supabase';

export const setupAdmin = async () => {
    console.log('Starting Admin Setup...');
    const email = 'pedrorraposo@gmail.com';
    const password = 'pmrr2007';
    const phone = '969622689';
    const name = 'Pedro';

    try {
        // 1. Try to sign up
        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    name: name,
                    phone: phone,
                }
            }
        });

        let userId = signUpData.user?.id;

        if (signUpError) {
            console.log('Sign up error (user might exist):', signUpError.message);
            const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
                email,
                password
            });

            if (signInError) {
                console.error('Could not sign in either:', signInError.message);
                return;
            }
            userId = signInData.user?.id;
        }

        if (userId) {
            console.log('User ID:', userId);

            // 2. Update profile role
            // First check if profile exists
            const { data: profile, error: profileError } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', userId)
                .single();

            if (profileError && profileError.code !== 'PGRST116') { // PGRST116 is "Row not found"
                console.error('Error checking profile:', profileError);
            }

            if (profile) {
                console.log('Profile found, updating role...');
                const { error: updateError } = await supabase
                    .from('profiles')
                    .update({ role: 'admin', nome: name, telefone: phone }) // Ensure name/phone are set
                    .eq('id', userId);

                if (updateError) console.error('Error updating role:', updateError);
                else console.log('Role updated to ADMIN successfully!');
            } else {
                console.log('Profile not found, creating one...');
                const { error: insertError } = await supabase
                    .from('profiles')
                    .insert([
                        { id: userId, nome: name, email: email, telefone: phone, role: 'admin' }
                    ]);

                if (insertError) console.error('Error creating profile:', insertError);
                else console.log('Profile created with ADMIN role successfully!');
            }
        }

    } catch (e) {
        console.error('Unexpected error in setupAdmin:', e);
    }
};
