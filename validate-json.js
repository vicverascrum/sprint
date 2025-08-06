#!/usr/bin/env node

// Script para validar el archivo questions.json
const fs = require('fs');
const path = require('path');

const jsonPath = path.join(__dirname, 'src', 'data', 'questions.json');

try {
    console.log('🔍 Validando questions.json...');
    
    // Leer el archivo
    const jsonContent = fs.readFileSync(jsonPath, 'utf8');
    
    // Parsear JSON
    const data = JSON.parse(jsonContent);
    
    // Validaciones
    const errors = [];
    const warnings = [];
    let totalHours = 0;
    let complexityStats = {};
    
    // Validar estructura básica
    if (!data.formTitle) errors.push('❌ Falta formTitle');
    if (!data.subtitle) warnings.push('⚠️  Falta subtitle');
    if (!data.questions || !Array.isArray(data.questions)) {
        errors.push('❌ Falta array de questions');
    } else {
        // Validar cada pregunta
        data.questions.forEach((question, index) => {
            const questionNum = index + 1;
            
            if (!question.id) errors.push(`❌ Pregunta ${questionNum}: Falta id`);
            if (!question.type) errors.push(`❌ Pregunta ${questionNum}: Falta type`);
            if (!question.title) errors.push(`❌ Pregunta ${questionNum}: Falta title`);
            
            // Validar estimaciones de horas
            if (question.type === 'radio' && question.estimatedHours) {
                totalHours += question.estimatedHours;
            }
            
            // Estadísticas de complejidad
            if (question.complexity) {
                complexityStats[question.complexity] = (complexityStats[question.complexity] || 0) + 1;
            }
            
            if (question.type === 'radio') {
                if (!question.options || !Array.isArray(question.options)) {
                    errors.push(`❌ Pregunta ${questionNum}: Falta array de options`);
                } else {
                    question.options.forEach((option, optIndex) => {
                        if (!option.value) errors.push(`❌ Pregunta ${questionNum}, Opción ${optIndex + 1}: Falta value`);
                        if (!option.label) errors.push(`❌ Pregunta ${questionNum}, Opción ${optIndex + 1}: Falta label`);
                    });
                }
                
                // Validar campos adicionales
                if (!question.complexity) warnings.push(`⚠️  Pregunta ${questionNum}: Falta complexity`);
                if (question.estimatedHours === undefined) warnings.push(`⚠️  Pregunta ${questionNum}: Falta estimatedHours`);
            }
            
            if (question.type === 'email') {
                if (!question.placeholder) warnings.push(`⚠️  Pregunta ${questionNum}: Falta placeholder`);
            }
        });
    }
    
    // Mostrar resultados
    if (errors.length === 0) {
        console.log('✅ JSON válido!');
        console.log(`📊 Estadísticas:`);
        console.log(`   - Total de preguntas: ${data.questions.length}`);
        console.log(`   - Preguntas de email: ${data.questions.filter(q => q.type === 'email').length}`);
        console.log(`   - Preguntas de radio: ${data.questions.filter(q => q.type === 'radio').length}`);
        console.log(`   - Total horas estimadas: ${totalHours}h`);
        
        if (Object.keys(complexityStats).length > 0) {
            console.log(`   - Distribución de complejidad:`);
            Object.entries(complexityStats).forEach(([complexity, count]) => {
                console.log(`     • ${complexity}: ${count} items`);
            });
        }
        
        // Análisis de riesgos técnicos
        const technicalRiskItems = data.questions.filter(q => q.technicalRisk);
        if (technicalRiskItems.length > 0) {
            console.log(`   - Items con riesgo técnico: ${technicalRiskItems.length}`);
        }
        
        // Análisis de proyectos mayores
        const majorProjects = data.questions.filter(q => q.majorProject);
        if (majorProjects.length > 0) {
            console.log(`   - Proyectos mayores: ${majorProjects.length}`);
        }
        
        if (warnings.length > 0) {
            console.log('\n⚠️  Advertencias:');
            warnings.forEach(warning => console.log(`   ${warning}`));
        }
        
        // Recomendaciones
        console.log('\n💡 Recomendaciones:');
        if (totalHours > 80) {
            console.log('   - Total de horas excede capacidad típica de sprint (80h)');
        }
        
        const highComplexityItems = data.questions.filter(q => 
            q.complexity === 'High' || q.complexity === 'Very High' || q.complexity === 'Critical'
        ).length;
        
        if (highComplexityItems > 3) {
            console.log('   - Considerar distribuir items de alta complejidad entre sprints');
        }
        
    } else {
        console.log('❌ JSON inválido!');
        console.log('\n🚨 Errores encontrados:');
        errors.forEach(error => console.log(`   ${error}`));
        
        if (warnings.length > 0) {
            console.log('\n⚠️  Advertencias:');
            warnings.forEach(warning => console.log(`   ${warning}`));
        }
        process.exit(1);
    }
    
} catch (error) {
    console.error('❌ Error al validar JSON:', error.message);
    process.exit(1);
}
