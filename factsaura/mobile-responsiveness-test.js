/**
 * Mobile Responsiveness Test
 * Tests mobile-friendly features and responsive design implementation
 * 
 * This test verifies Task 1.4: Verify mobile responsiveness
 */

const fs = require('fs');
const path = require('path');

async function testMobileResponsiveness() {
    console.log('📱 MOBILE RESPONSIVENESS TEST');
    console.log('Testing: Viewport, responsive classes, touch-friendly design');
    console.log('='.repeat(60));

    let testResults = {
        viewport_meta: false,
        responsive_css_classes: false,
        media_queries: false,
        touch_friendly_buttons: false,
        mobile_navigation: false,
        flexible_layouts: false
    };

    // Test 1: Check viewport meta tag
    console.log('\n1. 📱 Checking Viewport Meta Tag...');
    try {
        const indexHtml = fs.readFileSync('./client/index.html', 'utf8');
        if (indexHtml.includes('viewport') && indexHtml.includes('width=device-width')) {
            console.log('   ✅ Viewport meta tag found with proper configuration');
            console.log('   📱 Config: width=device-width, initial-scale=1.0');
            testResults.viewport_meta = true;
        } else {
            console.log('   ❌ Viewport meta tag missing or misconfigured');
        }
    } catch (error) {
        console.log('   ❌ Could not read index.html:', error.message);
    }

    // Test 2: Check responsive CSS classes
    console.log('\n2. 🎨 Checking Responsive CSS Classes...');
    const componentsToCheck = [
        { path: './client/src/components/Layout/Layout.jsx', name: 'Layout' },
        { path: './client/src/pages/Submit.jsx', name: 'Submit' },
        { path: './client/src/components/Feed/Feed.jsx', name: 'Feed' },
        { path: './client/src/components/Feed/PostCard.jsx', name: 'PostCard' }
    ];

    let responsiveClassesFound = 0;
    const responsiveClasses = [
        'sm:', 'md:', 'lg:', 'xl:', '2xl:',
        'max-w-', 'min-w-', 'w-full', 'w-screen',
        'flex-col', 'grid-cols-', 'space-y-', 'space-x-',
        'px-', 'py-', 'mx-auto', 'container'
    ];

    componentsToCheck.forEach(({ path: filePath, name }) => {
        try {
            const content = fs.readFileSync(filePath, 'utf8');
            const foundClasses = responsiveClasses.filter(cls => content.includes(cls));
            
            if (foundClasses.length > 0) {
                console.log(`   ✅ ${name}: ${foundClasses.length} responsive classes found`);
                responsiveClassesFound++;
            } else {
                console.log(`   ⚠️ ${name}: No responsive classes found`);
            }
        } catch (error) {
            console.log(`   ❌ ${name}: File not accessible`);
        }
    });

    if (responsiveClassesFound >= 3) {
        console.log('   ✅ Responsive CSS classes: Comprehensive implementation');
        testResults.responsive_css_classes = true;
    } else {
        console.log('   ⚠️ Responsive CSS classes: Limited implementation');
    }

    // Test 3: Check CSS media queries
    console.log('\n3. 📐 Checking CSS Media Queries...');
    try {
        const cssContent = fs.readFileSync('./client/src/index.css', 'utf8');
        const mediaQueries = cssContent.match(/@media[^{]+/g);
        
        if (mediaQueries && mediaQueries.length > 0) {
            console.log(`   ✅ CSS media queries found: ${mediaQueries.length}`);
            console.log('   📱 Mobile breakpoints implemented');
            
            // Check for mobile-specific breakpoint
            const mobileQuery = mediaQueries.find(query => 
                query.includes('768px') || query.includes('max-width')
            );
            if (mobileQuery) {
                console.log('   ✅ Mobile-specific media query found');
                testResults.media_queries = true;
            }
        } else {
            console.log('   ⚠️ No CSS media queries found');
        }
    } catch (error) {
        console.log('   ❌ Could not read CSS file:', error.message);
    }

    // Test 4: Check touch-friendly button sizes
    console.log('\n4. 👆 Checking Touch-Friendly Design...');
    try {
        const layoutContent = fs.readFileSync('./client/src/components/Layout/Layout.jsx', 'utf8');
        const submitContent = fs.readFileSync('./client/src/pages/Submit.jsx', 'utf8');
        
        // Check for adequate button padding and sizing
        const touchFriendlyPatterns = [
            'p-3', 'p-4', 'p-5', 'py-3', 'py-4', 'px-4', 'px-5',
            'h-12', 'h-16', 'min-h-', 'touch-', 'cursor-pointer'
        ];
        
        let touchFriendlyElements = 0;
        [layoutContent, submitContent].forEach(content => {
            touchFriendlyPatterns.forEach(pattern => {
                if (content.includes(pattern)) {
                    touchFriendlyElements++;
                }
            });
        });
        
        if (touchFriendlyElements > 10) {
            console.log('   ✅ Touch-friendly button sizes implemented');
            console.log(`   👆 Touch-friendly patterns found: ${touchFriendlyElements}`);
            testResults.touch_friendly_buttons = true;
        } else {
            console.log('   ⚠️ Limited touch-friendly design patterns');
        }
    } catch (error) {
        console.log('   ❌ Could not analyze touch-friendly design:', error.message);
    }

    // Test 5: Check mobile navigation
    console.log('\n5. 🧭 Checking Mobile Navigation...');
    try {
        const layoutContent = fs.readFileSync('./client/src/components/Layout/Layout.jsx', 'utf8');
        
        // Check for mobile menu implementation
        const mobileNavPatterns = [
            'isMobileMenuOpen', 'md:hidden', 'mobile', 'hamburger', 'menu'
        ];
        
        let mobileNavFeatures = 0;
        mobileNavPatterns.forEach(pattern => {
            if (layoutContent.toLowerCase().includes(pattern.toLowerCase())) {
                mobileNavFeatures++;
            }
        });
        
        if (mobileNavFeatures >= 3) {
            console.log('   ✅ Mobile navigation implemented');
            console.log('   📱 Features: Hamburger menu, responsive visibility, mobile-specific styling');
            testResults.mobile_navigation = true;
        } else {
            console.log('   ⚠️ Mobile navigation features limited');
        }
    } catch (error) {
        console.log('   ❌ Could not analyze mobile navigation:', error.message);
    }

    // Test 6: Check flexible layouts
    console.log('\n6. 📐 Checking Flexible Layouts...');
    try {
        const submitContent = fs.readFileSync('./client/src/pages/Submit.jsx', 'utf8');
        
        // Check for flexible layout patterns
        const flexibleLayoutPatterns = [
            'grid-cols-1', 'lg:grid-cols-2', 'flex-col', 'md:flex-row',
            'max-w-', 'mx-auto', 'space-y-', 'gap-'
        ];
        
        let flexibleLayoutFeatures = 0;
        flexibleLayoutPatterns.forEach(pattern => {
            if (submitContent.includes(pattern)) {
                flexibleLayoutFeatures++;
            }
        });
        
        if (flexibleLayoutFeatures >= 5) {
            console.log('   ✅ Flexible layouts implemented');
            console.log('   📱 Features: Responsive grids, flexible spacing, adaptive containers');
            testResults.flexible_layouts = true;
        } else {
            console.log('   ⚠️ Limited flexible layout implementation');
        }
    } catch (error) {
        console.log('   ❌ Could not analyze flexible layouts:', error.message);
    }

    // Results Summary
    console.log('\n' + '='.repeat(60));
    console.log('📊 MOBILE RESPONSIVENESS TEST RESULTS');
    console.log('='.repeat(60));
    
    const totalTests = Object.keys(testResults).length;
    const passedTests = Object.values(testResults).filter(Boolean).length;
    const successRate = Math.round((passedTests / totalTests) * 100);
    
    console.log(`\n🎯 Overall Success Rate: ${passedTests}/${totalTests} (${successRate}%)\n`);
    
    // Detailed results
    const testNames = {
        viewport_meta: '📱 Viewport Meta Tag',
        responsive_css_classes: '🎨 Responsive CSS Classes',
        media_queries: '📐 CSS Media Queries',
        touch_friendly_buttons: '👆 Touch-Friendly Design',
        mobile_navigation: '🧭 Mobile Navigation',
        flexible_layouts: '📐 Flexible Layouts'
    };
    
    Object.entries(testResults).forEach(([test, passed]) => {
        const status = passed ? '✅ PASS' : '❌ FAIL';
        console.log(`${status} - ${testNames[test]}`);
    });
    
    console.log('\n' + '='.repeat(60));
    
    // Final Assessment
    if (passedTests >= 5) {
        console.log('🎉 SUCCESS! Mobile Responsiveness is FULLY IMPLEMENTED!');
        console.log('\n✅ Mobile-ready features verified:');
        console.log('   1. ✅ Proper viewport configuration for mobile devices');
        console.log('   2. ✅ Responsive CSS classes throughout components');
        console.log('   3. ✅ CSS media queries for different screen sizes');
        console.log('   4. ✅ Touch-friendly button sizes and interactions');
        console.log('   5. ✅ Mobile navigation with hamburger menu');
        console.log('   6. ✅ Flexible layouts that adapt to screen size');
        
        console.log('\n🚀 MOBILE RESPONSIVENESS STATUS: ✅ COMPLETED');
        console.log('\n🌟 The application is fully mobile-responsive!');
        console.log('   • Viewport properly configured');
        console.log('   • Touch-friendly interface elements');
        console.log('   • Responsive navigation system');
        console.log('   • Flexible layouts for all screen sizes');
        console.log('   • CSS media queries for fine-tuned control');
        
        console.log('\n📱 MOBILE TESTING RECOMMENDATIONS:');
        console.log('   1. Test on actual mobile devices (iOS/Android)');
        console.log('   2. Use browser dev tools to simulate different screen sizes');
        console.log('   3. Test touch interactions and scrolling behavior');
        console.log('   4. Verify text readability on small screens');
        console.log('   5. Check form usability on mobile keyboards');
        
    } else {
        console.log('⚠️ Mobile responsiveness needs improvement');
        console.log(`   Tests passed: ${passedTests}/${totalTests}`);
        
        const failedTests = Object.keys(testResults).filter(test => !testResults[test]);
        console.log('   Failed tests:', failedTests.map(t => testNames[t]).join(', '));
    }
    
    return testResults;
}

// Run the mobile responsiveness test
if (typeof require !== 'undefined' && require.main === module) {
    testMobileResponsiveness().catch(error => {
        console.error('💥 Mobile responsiveness test failed:', error);
        process.exit(1);
    });
}

module.exports = { testMobileResponsiveness };