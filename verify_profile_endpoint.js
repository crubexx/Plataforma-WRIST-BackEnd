import fetch from 'node-fetch';

const baseUrl = 'http://localhost:3000/api'; // Adjust to your actual backend URL

async function verifyCompleteProfile() {
    console.log('🚀 Starting verification of Complete Profile endpoint...');

    // Note: Since I don't have a valid JWT here, I can't fully test the endpoint without manual intervention
    // or mocking the middleware. However, I can check if the route exists and returns 401/403.

    try {
        const response = await fetch(`${baseUrl}/auth/complete-profile`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                rut: '12345678-9',
                gender: 'Masculino',
                birth_date: '1990-01-01'
            })
        });

        console.log(`📡 Response status: ${response.status}`);
        const data = await response.json();
        console.log('📦 Response data:', data);

        if (response.status === 401 || response.status === 403) {
            console.log('✅ Route is protected (Expected without token)');
        } else if (response.status === 200) {
            console.log('✅ Route is working correctly');
        } else {
            console.log('❌ Unexpected response status');
        }
    } catch (error) {
        console.error('❌ Verification failed:', error.message);
    }
}

verifyCompleteProfile();
