// Data Analysis Script for Sprint Prioritization
const https = require('https');

function fetchData() {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: 'dubo90gxce.execute-api.us-east-1.amazonaws.com',
            port: 443,
            path: '/prod/query',
            method: 'GET',
            headers: {
                'Accept': 'application/json'
            }
        };

        const req = https.request(options, (res) => {
            let data = '';
            res.on('data', (chunk) => {
                data += chunk;
            });

            res.on('end', () => {
                try {
                    const response = JSON.parse(data);
                    resolve(response);
                } catch (error) {
                    reject(error);
                }
            });
        });

        req.on('error', (error) => {
            reject(error);
        });

        req.end();
    });
}

function analyzeData(data) {
    console.log('📊 ANÁLISIS DE DATOS - SPRINT PRIORITIZATION');
    console.log('=' .repeat(60));
    
    if (!data.success || !data.submissions) {
        console.log('❌ Error: No se pudieron obtener los datos');
        return;
    }

    const submissions = data.submissions;
    
    // Estadísticas generales
    console.log(`\n📈 ESTADÍSTICAS GENERALES:`);
    console.log(`   Total de envíos: ${submissions.length}`);
    console.log(`   Fecha del primer envío: ${new Date(submissions[submissions.length - 1].submittedAt).toLocaleString()}`);
    console.log(`   Fecha del último envío: ${new Date(submissions[0].submittedAt).toLocaleString()}`);
    
    // Análisis por usuario
    console.log(`\n👥 ANÁLISIS POR USUARIO:`);
    const userStats = {};
    submissions.forEach(sub => {
        if (!userStats[sub.email]) {
            userStats[sub.email] = {
                count: 0,
                totalHours: 0,
                submissions: []
            };
        }
        userStats[sub.email].count++;
        userStats[sub.email].totalHours += sub.totalHours;
        userStats[sub.email].submissions.push(sub);
    });
    
    Object.entries(userStats).forEach(([email, stats]) => {
        console.log(`   📧 ${email}:`);
        console.log(`      - Envíos: ${stats.count}`);
        console.log(`      - Total horas: ${stats.totalHours}h`);
        console.log(`      - Promedio por envío: ${Math.round(stats.totalHours / stats.count)}h`);
    });
    
    // Análisis de horas
    console.log(`\n⏰ ANÁLISIS DE HORAS:`);
    const totalHours = submissions.reduce((sum, sub) => sum + sub.totalHours, 0);
    const avgHours = Math.round(totalHours / submissions.length);
    const maxHours = Math.max(...submissions.map(sub => sub.totalHours));
    const minHours = Math.min(...submissions.map(sub => sub.totalHours));
    
    console.log(`   Total de horas seleccionadas: ${totalHours}h`);
    console.log(`   Promedio por envío: ${avgHours}h`);
    console.log(`   Máximo en un envío: ${maxHours}h`);
    console.log(`   Mínimo en un envío: ${minHours}h`);
    
    // Análisis de items más populares
    console.log(`\n🏆 ITEMS MÁS POPULARES:`);
    const itemStats = {};
    
    submissions.forEach(sub => {
        sub.selections.forEach(selection => {
            const key = selection.id || selection.questionNumber || 'unknown';
            const title = selection.title || selection.questionTitle || 'Sin título';
            const hours = selection.estimatedHours || 0;
            
            if (!itemStats[key]) {
                itemStats[key] = {
                    title: title,
                    count: 0,
                    totalHours: 0,
                    hours: hours
                };
            }
            itemStats[key].count++;
            if (typeof hours === 'number') {
                itemStats[key].totalHours += hours;
            }
        });
    });
    
    const sortedItems = Object.entries(itemStats)
        .sort(([,a], [,b]) => b.count - a.count)
        .slice(0, 5);
    
    sortedItems.forEach(([id, stats], index) => {
        console.log(`   ${index + 1}. ${id} (${stats.count} votos)`);
        console.log(`      "${stats.title.substring(0, 60)}${stats.title.length > 60 ? '...' : ''}"`);
        console.log(`      Horas estimadas: ${stats.hours}h`);
    });
    
    // Análisis temporal
    console.log(`\n📅 ANÁLISIS TEMPORAL:`);
    const timeStats = {};
    submissions.forEach(sub => {
        const date = new Date(sub.submittedAt).toDateString();
        if (!timeStats[date]) {
            timeStats[date] = 0;
        }
        timeStats[date]++;
    });
    
    Object.entries(timeStats).forEach(([date, count]) => {
        console.log(`   ${date}: ${count} envío(s)`);
    });
    
    // Capacidad del sprint
    console.log(`\n🎯 ANÁLISIS DE CAPACIDAD (260h límite):`);
    const CAPACITY_LIMIT = 260;
    submissions.forEach((sub, index) => {
        const percentage = Math.round((sub.totalHours / CAPACITY_LIMIT) * 100);
        const status = percentage > 100 ? '🔴 SOBRE CAPACIDAD' : 
                      percentage > 80 ? '🟡 CERCA DEL LÍMITE' : 
                      percentage > 50 ? '🟢 BUENA CAPACIDAD' : '🔵 CARGA LIGERA';
        
        console.log(`   Envío #${sub.id}: ${sub.totalHours}h (${percentage}%) ${status}`);
    });
    
    console.log('\n' + '=' .repeat(60));
    console.log('✅ Análisis completado');
}

// Ejecutar análisis
fetchData()
    .then(analyzeData)
    .catch(error => {
        console.error('❌ Error obteniendo datos:', error.message);
    });
