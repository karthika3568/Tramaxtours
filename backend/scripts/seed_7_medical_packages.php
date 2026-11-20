<?php
/**
 * Seeder for all 7 Medical Packages, Clinical Assessments, Tests, and 8 Medical Add-ons.
 * Accurate content per client specifications without external diagnostic center branding.
 */

declare(strict_types=1);

define('BACKEND_ROOT', dirname(__DIR__));
require_once BACKEND_ROOT . '/vendor/autoload.php';
\App\Utils\Env::load(BACKEND_ROOT . '/.env');
$db = \App\Utils\Database::getConnection();

echo "Starting Medical Packages & Add-ons Seeding...\n";

// Disable foreign key checks for clean reload
$db->exec("SET FOREIGN_KEY_CHECKS = 0");
$db->exec("TRUNCATE TABLE `medical_assessment_tests`");
$db->exec("TRUNCATE TABLE `medical_assessments`");
$db->exec("TRUNCATE TABLE `medical_addons`");
$db->exec("TRUNCATE TABLE `medical_trips`");
$db->exec("SET FOREIGN_KEY_CHECKS = 1");

$packages = [
    // 1. JANA SEVA GOLD
    [
        'title' => 'Jana Seva Gold',
        'slug' => 'jana-seva-gold',
        'category' => 'Preventive Health Screening',
        'short_description' => 'Comprehensive preventive full body screening with 4 radiology diagnostics and 89 clinical lab tests including cancer screening, organ profiles, and vitamin markers.',
        'description' => 'Jana Seva Gold provides an extensive multi-speciality clinical overview of your vital organs and physiological health markers. Includes ultrasound abdomen & pelvic imaging, ECG, chest X-ray, and cancer markers.',
        'duration' => '1 Day',
        'price' => 4999.00,
        'market_price' => 14325.00,
        'discount' => '65%',
        'test_count' => '93 Tests (4 Radiology + 89 Lab Tests)',
        'price_on_request' => 0,
        'currency' => 'INR',
        'location' => 'Chennai, Tamil Nadu',
        'featured_image' => '/uploads/media/medical_package_banner.jpg',
        'banner_title' => 'Jana Seva Gold • Full Body Preventive Health Check',
        'banner_subtitle' => '4 Radiology Diagnostics & 89 Clinical Laboratory Tests',
        'banner_description' => 'Advanced ultrasound, cardiac electrical rhythm, pulmonary chest imaging, comprehensive organ profiles, and male/female cancer markers.',
        'banner_image' => '/uploads/media/medical_package_banner.jpg',
        'highlights' => json_encode([
            '4 Radiology Diagnostics (ECG, Ultrasound Abdomen & Pelvis, X-Ray Chest, CT Calcium Scoring or Echo Scan)',
            '89 Certified Clinical Lab Tests (Liver, Kidney, Lipid, Thyroid, HbA1c, CBC, Urine)',
            'Cancer Screening (PSA Total for Men, CA 125 for Women, CEA for Colon/Liver/Pancreas)',
            'Nutritional Markers (Vitamin B12 & Vitamin D)',
            'Same-day digital diagnostic reporting & specialist physician consultation',
        ]),
        'benefits' => json_encode([
            'Early detection of cardiovascular, metabolic, and liver risks',
            'Full pelvic and abdominal ultrasound examination',
            'Comprehensive blood count across 28 parameters',
            'Personalized physician health counseling and review',
        ]),
        'instructions' => 'Fasting of 10 to 12 hours is recommended prior to sample collection. Water is allowed.',
        'preparation_guidelines' => "• 10–12 hours overnight fasting required.\n• Water intake is allowed and encouraged to stay hydrated.\n• Wear comfortable two-piece clothing for ultrasound and ECG.\n• Carry prior medical reports if available.",
        'included_services' => json_encode(['Radiology Diagnostics', 'Pathology Lab Tests', 'Doctor Consultation', 'Digital Health Record']),
        'excluded_services' => json_encode(['Medications', 'Specialist Surgeries']),
        'cancellation_policy' => 'Free rescheduling up to 24 hours before your booked appointment.',
        'is_active' => 1,
        'is_published' => 1,
        'display_order' => 1,
        'assessments' => [
            [
                'title' => 'Radiology & Cardiac Imaging (4 Tests)',
                'subtitle' => 'Non-invasive imaging diagnostics',
                'description' => 'Comprehensive structural and electrical screening of the heart, lungs, and abdominal cavity.',
                'icon' => 'Activity',
                'display_order' => 1,
                'tests' => [
                    ['test_name' => 'ECG', 'description' => '12-lead Electrocardiogram checking electrical rhythm, rate, and cardiac risk markers.'],
                    ['test_name' => 'Ultrasound Scan for Abdomen & Pelvic Organs', 'description' => 'High-resolution sonography of liver, gallbladder, kidneys, spleen, pancreas, bladder, and pelvic organs.'],
                    ['test_name' => 'X-Ray Chest', 'description' => 'Digital chest radiograph assessing lung parenchyma, cardiac shadow, and thoracic cage.'],
                    ['test_name' => 'CT Calcium Scoring or Echo Scan (Heart Risk)', 'description' => 'Evaluates coronary calcium build-up or 2D echocardiography for cardiac wall motion and valve function.'],
                ],
            ],
            [
                'title' => 'Cancer Screening Markers (3 Tests)',
                'subtitle' => 'Tumour antigen blood screening',
                'description' => 'Essential serum biomarkers to screen for early occult malignant changes.',
                'icon' => 'Shield',
                'display_order' => 2,
                'tests' => [
                    ['test_name' => 'Male – PSA Total', 'description' => 'Prostate-Specific Antigen screening for benign hyperplasia or prostate malignancy in men.'],
                    ['test_name' => 'Female – Ovaries – CA 125', 'description' => 'Cancer Antigen 125 screening marker for ovarian tissue health in women.'],
                    ['test_name' => 'Colon, Liver, Pancreas – CEA', 'description' => 'Carcinoembryonic Antigen screening for gastrointestinal, colonic, and hepatic cellular changes.'],
                ],
            ],
            [
                'title' => 'Vitamins & Essential Minerals (2 Tests)',
                'subtitle' => 'Cellular nutrition and musculoskeletal vitality',
                'description' => 'Measures vital micronutrients essential for nerve transmission, hematopoiesis, and bone mineralization.',
                'icon' => 'Sun',
                'display_order' => 3,
                'tests' => [
                    ['test_name' => 'Vitamin B12', 'description' => 'Cyanocobalamin evaluation for neurological function, memory, and healthy red blood cell production.'],
                    ['test_name' => 'Vitamin D', 'description' => '25-Hydroxy Vitamin D level reflecting bone density, calcium metabolism, and immune balance.'],
                ],
            ],
            [
                'title' => 'Thyroid Function Tests (3 Tests)',
                'subtitle' => 'Endocrine & basal metabolic rate regulation',
                'description' => 'Complete tri-hormonal panel screening for hypothyroidism, hyperthyroidism, and metabolic slowdown.',
                'icon' => 'Heart',
                'display_order' => 4,
                'tests' => [
                    ['test_name' => 'T3 (Triiodothyronine)', 'description' => 'Active thyroid hormone regulating metabolic rate.'],
                    ['test_name' => 'T4 (Thyroxine)', 'description' => 'Primary thyroid hormone regulating energy and growth.'],
                    ['test_name' => 'TSH (Thyroid Stimulating Hormone)', 'description' => 'Pituitary regulator of thyroid activity.'],
                ],
            ],
            [
                'title' => 'Diabetic Tests with HbA1c (2 Tests)',
                'subtitle' => 'Blood sugar and 90-day glycemic control',
                'description' => 'Identifies pre-diabetes, acute hyperglycemia, and long-term glycemic trends.',
                'icon' => 'CheckCircle',
                'display_order' => 5,
                'tests' => [
                    ['test_name' => 'Fasting Blood Sugar (FBS)', 'description' => 'Measures baseline morning glucose after 10-12 hours fasting.'],
                    ['test_name' => 'Glycosylated Hemoglobin (HbA1c)', 'description' => 'Gold standard 3-month average blood glucose control and diabetic risk assessment.'],
                ],
            ],
            [
                'title' => 'Lipid Profile (9 Tests)',
                'subtitle' => 'Cardiovascular cholesterol and coronary risk factors',
                'description' => 'Detailed fractionation of blood lipids to evaluate coronary plaque vulnerability.',
                'icon' => 'TrendingUp',
                'display_order' => 6,
                'tests' => [
                    ['test_name' => 'Total Cholesterol', 'description' => 'Total circulating blood cholesterol.'],
                    ['test_name' => 'HDL Cholesterol', 'description' => 'High-Density Lipoprotein (cardio-protective good cholesterol).'],
                    ['test_name' => 'LDL Cholesterol', 'description' => 'Low-Density Lipoprotein (atherogenic bad cholesterol).'],
                    ['test_name' => 'Triglycerides', 'description' => 'Blood fats linked to insulin resistance and arterial hardening.'],
                    ['test_name' => 'VLDL Cholesterol', 'description' => 'Very Low-Density Lipoprotein level.'],
                    ['test_name' => 'Total Cholesterol / HDL Ratio', 'description' => 'Key index predicting coronary heart disease vulnerability.'],
                    ['test_name' => 'LDL / HDL Ratio', 'description' => 'Cardiovascular risk stratification ratio.'],
                    ['test_name' => 'Triglycerides / HDL Ratio', 'description' => 'Indicator of atherogenic dyslipidemia and insulin resistance.'],
                    ['test_name' => 'Non-HDL Cholesterol', 'description' => 'All atherogenic particles in circulation.'],
                ],
            ],
            [
                'title' => 'Kidney Function Tests (3 Tests)',
                'subtitle' => 'Renal clearance and nitrogenous waste filtration',
                'description' => 'Assesses nephron filtration, glomerular health, and purine metabolism.',
                'icon' => 'Droplet',
                'display_order' => 7,
                'tests' => [
                    ['test_name' => 'Serum Creatinine', 'description' => 'Primary indicator of kidney filtration efficiency and glomerular function.'],
                    ['test_name' => 'Blood Urea', 'description' => 'Evaluates protein breakdown and renal elimination.'],
                    ['test_name' => 'Serum Uric Acid', 'description' => 'Screens for hyperuricemia, gout risk, and renal crystallization.'],
                ],
            ],
            [
                'title' => 'Liver Function Tests (12 Tests)',
                'subtitle' => 'Hepatic enzymes, proteins, and biliary clearance',
                'description' => 'Comprehensive panel evaluating liver parenchyma, detoxifying efficiency, and biliary tree.',
                'icon' => 'Layers',
                'display_order' => 8,
                'tests' => [
                    ['test_name' => 'Bilirubin Total', 'description' => 'Total bile pigment in circulation.'],
                    ['test_name' => 'Bilirubin Direct', 'description' => 'Conjugated bilirubin reflecting biliary excretion.'],
                    ['test_name' => 'Bilirubin Indirect', 'description' => 'Unconjugated bilirubin reflecting hemolysis or hepatic uptake.'],
                    ['test_name' => 'SGOT (AST)', 'description' => 'Serum Glutamic Oxaloacetic Transaminase.'],
                    ['test_name' => 'SGPT (ALT)', 'description' => 'Serum Glutamic Pyruvic Transaminase (sensitive liver injury marker).'],
                    ['test_name' => 'AST / ALT Ratio', 'description' => 'Differentiates alcoholic vs non-alcoholic liver pathology.'],
                    ['test_name' => 'Alkaline Phosphatase (ALP)', 'description' => 'Biliary canalicular and bone turnover enzyme.'],
                    ['test_name' => 'Total Protein', 'description' => 'Total circulating albumin and globulin proteins.'],
                    ['test_name' => 'Serum Albumin', 'description' => 'Major liver-synthesized protein for oncotic pressure.'],
                    ['test_name' => 'Serum Globulin', 'description' => 'Immunoglobulins and transport proteins.'],
                    ['test_name' => 'Albumin / Globulin Ratio', 'description' => 'Evaluates hepatic synthesis versus immune activation.'],
                    ['test_name' => 'Gamma GT (GGT)', 'description' => 'Sensitive biliary marker and indicator of hepatic stress.'],
                ],
            ],
            [
                'title' => 'Infection Screen – ESR (1 Test)',
                'subtitle' => 'Systemic inflammatory reaction index',
                'description' => 'Measures sedimentation of erythrocytes in anticoagulated blood.',
                'icon' => 'AlertCircle',
                'display_order' => 9,
                'tests' => [
                    ['test_name' => 'ESR (Erythrocyte Sedimentation Rate)', 'description' => 'Screens for occult infection, chronic inflammation, or rheumatological activity.'],
                ],
            ],
            [
                'title' => 'Complete Blood Count – CBC (28 Tests)',
                'subtitle' => 'Comprehensive hematological profile',
                'description' => '28 automated hematology parameters analyzing red blood cells, white blood cells, and platelets.',
                'icon' => 'Database',
                'display_order' => 10,
                'tests' => [
                    ['test_name' => 'Hemoglobin (Hb)', 'description' => 'Oxygen-carrying capacity of blood.'],
                    ['test_name' => 'Total WBC Count', 'description' => 'Total white blood cell count for immune defense.'],
                    ['test_name' => 'RBC Count', 'description' => 'Total red blood cell concentration.'],
                    ['test_name' => 'Packed Cell Volume (PCV)', 'description' => 'Hematocrit percentage of red cells.'],
                    ['test_name' => 'Mean Corpuscular Volume (MCV)', 'description' => 'Average red cell volume.'],
                    ['test_name' => 'Mean Corpuscular Hemoglobin (MCH)', 'description' => 'Average hemoglobin mass per red cell.'],
                    ['test_name' => 'Mean Corpuscular Hb Concentration (MCHC)', 'description' => 'Concentration of hemoglobin in packed red cells.'],
                    ['test_name' => 'RDW-CV', 'description' => 'Red cell distribution width coefficient of variation.'],
                    ['test_name' => 'RDW-SD', 'description' => 'Red cell distribution width standard deviation.'],
                    ['test_name' => 'Platelet Count', 'description' => 'Essential for blood clotting and hemostasis.'],
                    ['test_name' => 'Neutrophils %', 'description' => 'Primary bacterial defense phagocytes.'],
                    ['test_name' => 'Lymphocytes %', 'description' => 'Viral immune response cells.'],
                    ['test_name' => 'Monocytes %', 'description' => 'Phagocytic immune cells.'],
                    ['test_name' => 'Eosinophils %', 'description' => 'Allergic response and parasite defense cells.'],
                    ['test_name' => 'Basophils %', 'description' => 'Histamine-releasing inflammatory cells.'],
                    ['test_name' => 'Absolute Neutrophil Count (ANC)', 'description' => 'Absolute count of circulating neutrophils.'],
                    ['test_name' => 'Absolute Lymphocyte Count (ALC)', 'description' => 'Absolute count of circulating lymphocytes.'],
                    ['test_name' => 'Absolute Monocyte Count (AMC)', 'description' => 'Absolute count of circulating monocytes.'],
                    ['test_name' => 'Absolute Eosinophil Count (AEC)', 'description' => 'Absolute count of circulating eosinophils.'],
                    ['test_name' => 'Absolute Basophil Count (ABC)', 'description' => 'Absolute count of circulating basophils.'],
                    ['test_name' => 'Immature Granulocyte Percentage (IG%)', 'description' => 'Early bone marrow cellular output indicator.'],
                    ['test_name' => 'Neutrophil to Lymphocyte Ratio (NLR)', 'description' => 'Prognostic systemic inflammatory biomarker.'],
                    ['test_name' => 'Mean Platelet Volume (MPV)', 'description' => 'Average platelet size and reactivity.'],
                    ['test_name' => 'Platelet Distribution Width (PDW)', 'description' => 'Platelet size variation index.'],
                    ['test_name' => 'Plateletcrit (PCT)', 'description' => 'Total volume percentage occupied by platelets.'],
                    ['test_name' => 'P-LCR', 'description' => 'Platelet-large cell ratio.'],
                    ['test_name' => 'Mentzer Index', 'description' => 'Differentiates iron deficiency from thalassemia trait.'],
                    ['test_name' => 'Reticulocyte Count', 'description' => 'Bone marrow erythropoietic response rate.'],
                ],
            ],
            [
                'title' => 'Complete Urine Analysis',
                'subtitle' => 'Physical, chemical & microscopic examination',
                'description' => 'Screens for renal pathology, urinary tract infections, proteinuria, and hematuria.',
                'icon' => 'FileText',
                'display_order' => 11,
                'tests' => [
                    ['test_name' => 'Urine Complete Analysis (Physical, Chemical & Microscopic)', 'description' => 'Evaluates color, appearance, specific gravity, pH, protein, glucose, ketones, bilirubin, urobilinogen, nitrites, leukocyte esterase, pus cells, epithelial cells, RBCs, casts, crystals, and bacteria.'],
                ],
            ],
        ],
    ],

    // 2. JANA SEVA DIAMOND
    [
        'title' => 'Jana Seva Diamond',
        'slug' => 'jana-seva-diamond',
        'category' => 'Spine & Stroke Risk Screening',
        'short_description' => 'Includes all Jana Seva Gold tests plus dedicated cervical & lumbar MRI spine screening, carotid Doppler stroke risk screening, and comprehensive bone strength analysis.',
        'description' => 'Jana Seva Diamond expands preventive care with neurological and structural spinal screening. Features Lumbar and Cervical MRI for disc bulge detection, Carotid Doppler for cerebrovascular stroke risk, and targeted bone mineralization tests.',
        'duration' => '1 Day',
        'price' => 6999.00,
        'market_price' => 23450.00,
        'discount' => '60%',
        'test_count' => '101+ Tests (Gold + MRI Spine, Carotid Doppler & Bone Profile)',
        'price_on_request' => 0,
        'currency' => 'INR',
        'location' => 'Chennai, Tamil Nadu',
        'featured_image' => '/uploads/media/medical_full_body_mri.jpg',
        'banner_title' => 'Jana Seva Diamond • MRI Spine & Stroke Risk Check',
        'banner_subtitle' => 'Includes All Gold Tests + MRI Cervical/Lumbar + Carotid Doppler + Bone Strength',
        'banner_description' => 'Specialized neurological and musculoskeletal evaluation with lumbar & cervical MRI and carotid artery stroke risk screening.',
        'banner_image' => '/uploads/media/medical_full_body_mri.jpg',
        'highlights' => json_encode([
            'Includes all Jana Seva Gold package tests (4 Radiology + 89 Lab Tests)',
            'MRI Screening: Lumbar MRI Screening, Cervical MRI Screening, Disc Bulge & Spinal Cord Status',
            'Carotid Doppler Ultrasound: Stroke Risk Screening for carotid stenosis',
            'Bone Strength Profile: Serum Calcium, Phosphorus, and Vitamin D',
            'Specialist neurologist and radiologist report reviews',
        ]),
        'benefits' => json_encode([
            'Early detection of cervical & lumbar disc herniations and nerve compressions',
            'Screening for stroke risk and carotid artery atherosclerosis',
            'Bone mineral health evaluation for osteopenia/osteoporosis prevention',
            'Complete organ profiling and cancer markers from Gold package',
        ]),
        'instructions' => '10–12 hours fasting required. Remove metallic jewelry before MRI screening. Water is allowed.',
        'preparation_guidelines' => "• 10–12 hours overnight fasting for blood tests.\n• Remove all metallic objects, watches, and jewelry prior to MRI screening.\n• Inform staff if you have metal implants, pacemakers, or claustrophobia.\n• Water intake is allowed.",
        'included_services' => json_encode(['All Gold Tests', 'MRI Spine Screening', 'Carotid Doppler', 'Bone Profile', 'Doctor Consultation']),
        'excluded_services' => json_encode(['Contrast Injections', 'Treatment Medications']),
        'cancellation_policy' => 'Free cancellation and rescheduling up to 24 hours before your appointment.',
        'is_active' => 1,
        'is_published' => 1,
        'display_order' => 2,
        'assessments' => [
            [
                'title' => 'Core Inclusion: All Jana Seva Gold Tests',
                'subtitle' => 'Inherited comprehensive baseline package',
                'description' => 'Includes all 4 Radiology tests (ECG, Ultrasound Abdomen & Pelvis, Chest X-Ray, CT Calcium Scoring/Echo), 3 Cancer Screening Markers (PSA, CA-125, CEA), Thyroid (T3, T4, TSH), Diabetes (HbA1c, FBS), Lipid Profile (9), Kidney (3), Liver (12), Infection (ESR), Complete Blood Count (28), and Urine Analysis.',
                'icon' => 'CheckCircle',
                'display_order' => 1,
                'tests' => [
                    ['test_name' => 'Full Jana Seva Gold Package (93 Diagnostics)', 'description' => 'Complete inheritance of all 4 Radiology examinations, 3 Cancer markers, and 89 Clinical Laboratory tests.'],
                ],
            ],
            [
                'title' => 'MRI Spine Screening (4 Diagnostic Checks)',
                'subtitle' => 'Magnetic Resonance Imaging of the vertebral column',
                'description' => 'High-resolution MRI screening without ionizing radiation to assess spinal cord, discs, and neural foramina.',
                'icon' => 'Layers',
                'display_order' => 2,
                'tests' => [
                    ['test_name' => 'Lumbar MRI Screening', 'description' => 'Targeted imaging of lower back vertebrae L1-S1, intervertebral discs, and thecal sac.'],
                    ['test_name' => 'Cervical MRI Screening', 'description' => 'Targeted imaging of neck vertebrae C1-C7, spinal canal, and nerve roots.'],
                    ['test_name' => 'Disc Bulge Screening', 'description' => 'High-precision evaluation for disc desiccation, protrusions, and foraminal stenosis.'],
                    ['test_name' => 'Spinal Cord Status', 'description' => 'Assesses cord caliber, myelomalacia, and compressive neural pathology.'],
                ],
            ],
            [
                'title' => 'Carotid Doppler (1 Diagnostic Check)',
                'subtitle' => 'Extracranial cerebrovascular ultrasound',
                'description' => 'Assesses arterial blood flow to the brain and screens for early stroke warning signs.',
                'icon' => 'TrendingUp',
                'display_order' => 3,
                'tests' => [
                    ['test_name' => 'Stroke Risk Screening', 'description' => 'High-frequency duplex Doppler evaluation of common and internal carotid arteries measuring intimal-medial thickness (IMT) and atheromatous plaque stenosis.'],
                ],
            ],
            [
                'title' => 'Bone Strength & Mineral Profile (3 Tests)',
                'subtitle' => 'Skeletal density and mineral regulation',
                'description' => 'Crucial mineral markers that determine bone rigidity, neuromuscular excitability, and fracture risk.',
                'icon' => 'Shield',
                'display_order' => 4,
                'tests' => [
                    ['test_name' => 'Vitamin D', 'description' => '25-Hydroxy Vitamin D level assessing calcium absorption capacity.'],
                    ['test_name' => 'Calcium', 'description' => 'Total serum calcium fundamental for bone matrix and cardiac muscle contraction.'],
                    ['test_name' => 'Phosphorus', 'description' => 'Inorganic phosphorus balancing bone mineralization and cellular ATP production.'],
                ],
            ],
        ],
    ],

    // 3. JANA SEVA PLATINUM
    [
        'title' => 'Jana Seva Platinum',
        'slug' => 'jana-seva-platinum',
        'category' => 'Executive Brain & Metabolic Checkup',
        'short_description' => 'Includes all Jana Seva Diamond tests plus CT Brain, CT PNS (sinusitis & airway), and advanced inflammatory & insulin blood biomarkers.',
        'description' => 'Jana Seva Platinum is an executive screening package that adds neuro-cranial CT scanning, paranasal sinus CT evaluation, Fasting Insulin, IgE allergy screening, and high-sensitivity C-reactive protein (CRP).',
        'duration' => '1 Day',
        'price' => 9999.00,
        'market_price' => 40150.00,
        'discount' => '75%',
        'test_count' => '106+ Tests (Diamond + CT Brain, CT PNS & Advanced Blood Tests)',
        'price_on_request' => 0,
        'currency' => 'INR',
        'location' => 'Chennai, Tamil Nadu',
        'featured_image' => '/uploads/media/medical_blood_pro.jpg',
        'banner_title' => 'Jana Seva Platinum • Executive CT Brain & Metabolic Check',
        'banner_subtitle' => 'Includes All Diamond Tests + CT Brain + CT PNS + Insulin + IgE + CRP',
        'banner_description' => 'Executive level health assessment with neuro-cranial CT scanning, respiratory sinus mapping, allergy IgE, and inflammatory CRP.',
        'banner_image' => '/uploads/media/medical_blood_pro.jpg',
        'highlights' => json_encode([
            'Includes all Jana Seva Diamond package tests (Gold + Diamond additions)',
            'CT Brain (Screening for tumour, stroke, aneurysm, or abnormalities in the brain)',
            'CT PNS (High-resolution screening for sinusitis, polyps, and nasal airway obstructions)',
            'Special Blood Tests: Insulin (Fasting), IgE Allergy Test, CRP Inflammation Test',
            'Priority reporting and multi-specialist physician teleconsultation',
        ]),
        'benefits' => json_encode([
            'Definitive neuro-cranial CT imaging detecting hidden brain abnormalities',
            'Full paranasal sinus airway diagnostic mapping',
            'Fasting insulin measurement detecting early metabolic syndrome and insulin resistance',
            'Immunological and vascular inflammatory status via IgE and high-sensitivity CRP',
        ]),
        'instructions' => '10–12 hours fasting required. Water is permitted. Wear comfortable clothing without metal fasteners.',
        'preparation_guidelines' => "• 10–12 hours fasting for glucose and insulin testing.\n• Avoid heavy meals and caffeine before CT examination.\n• Water intake is allowed.\n• Advise physician if you have kidney conditions or prior contrast reactions.",
        'included_services' => json_encode(['All Diamond Tests', 'CT Brain', 'CT PNS', 'Special Blood Tests (Insulin, IgE, CRP)', 'Physician Consultation']),
        'excluded_services' => json_encode(['IV Contrast (unless advised)', 'Hospital Stay']),
        'cancellation_policy' => 'Free rescheduling up to 24 hours prior to appointment.',
        'is_active' => 1,
        'is_published' => 1,
        'display_order' => 3,
        'assessments' => [
            [
                'title' => 'Core Inclusion: All Jana Seva Diamond Tests',
                'subtitle' => 'Inherited Gold + Diamond diagnostic foundation',
                'description' => 'Includes all Gold radiology & 89 lab tests, plus Diamond MRI Spine screening (Lumbar & Cervical), Carotid Doppler stroke screening, and Bone Strength profile.',
                'icon' => 'CheckCircle',
                'display_order' => 1,
                'tests' => [
                    ['test_name' => 'Full Jana Seva Diamond Package (101+ Diagnostics)', 'description' => 'Complete inheritance of Gold (93 tests) + Diamond MRI Spine, Carotid Doppler, and Bone minerals.'],
                ],
            ],
            [
                'title' => 'CT Neuro-Cranial & Airway Imaging (2 Diagnostic Checks)',
                'subtitle' => 'High-resolution computed tomography scanning',
                'description' => 'Sub-millimeter slice CT diagnostic imaging for cranial and respiratory structures.',
                'icon' => 'Layers',
                'display_order' => 2,
                'tests' => [
                    ['test_name' => 'CT Brain', 'description' => 'Screening for tumour, vascular abnormalities, infarction, atrophy, or structural lesions in the brain.'],
                    ['test_name' => 'CT PNS', 'description' => 'Paranasal Sinus screening for chronic sinusitis, mucosal thickening, polyposis, and nasal airway obstructions.'],
                ],
            ],
            [
                'title' => 'Special Blood Tests (3 Tests)',
                'subtitle' => 'Metabolic, allergic, and systemic inflammation markers',
                'description' => 'Sensitive serum biomarkers providing proactive insight into metabolic and immunological regulation.',
                'icon' => 'Droplet',
                'display_order' => 3,
                'tests' => [
                    ['test_name' => 'Insulin (F)', 'description' => 'Fasting insulin in blood identifying early hyperinsulinemia and cellular insulin resistance.'],
                    ['test_name' => 'IgE', 'description' => 'Total Immunoglobulin E test for systemic allergy and hyper-reactivity.'],
                    ['test_name' => 'CRP', 'description' => 'C-Reactive Protein assessing active inflammation and arterial cardiovascular vulnerability.'],
                ],
            ],
        ],
    ],

    // 4. JS COMPREHENSIVE WHOLE BODY CHECKUP
    [
        'title' => 'JS Comprehensive Whole Body Checkup',
        'slug' => 'js-comprehensive-whole-body-checkup',
        'category' => 'Whole Body MRI & AI Diagnostics',
        'short_description' => 'Flagship whole body health package: Vital Full Body MRI scan, Liver Fat quantification, AI-powered Brain Age analysis, Neck & Brain Angiogram, Visceral Fat quantification, plus 3 Smart Reports.',
        'description' => 'JS Comprehensive Whole Body Checkup provides unmatched diagnostic depth. Combines multi-region MRI (Brain, Spine, Chest, Abdomen, Pelvis), specialized AI brain age analysis, 3D non-invasive angiograms, visceral and hepatic fat quantification, and personalized smart longevity reports.',
        'duration' => '1–2 Days',
        'price' => 32000.00,
        'market_price' => 129400.00,
        'discount' => '75%',
        'test_count' => '120+ Tests (Vital Full Body MRI + AI Brain Age + Angiogram + Smart Reports)',
        'price_on_request' => 0,
        'currency' => 'INR',
        'location' => 'Chennai, Tamil Nadu',
        'featured_image' => '/uploads/media/medical_package_banner.jpg',
        'banner_title' => 'JS Comprehensive Whole Body Checkup • Full Body MRI & AI',
        'banner_subtitle' => 'Vital Full Body MRI + AI Brain Age + Angiogram + Visceral Fat + 3 Smart Reports',
        'banner_description' => 'Our most comprehensive diagnostic program combining whole body magnetic resonance imaging, artificial intelligence analysis, and advanced metabolic profiling.',
        'banner_image' => '/uploads/media/medical_package_banner.jpg',
        'highlights' => json_encode([
            'Includes all Jana Seva Platinum package tests (Gold + Diamond + Platinum)',
            'A. Vital Full Body MRI Scan (Brain, PNS, Neck, Chest, Abdomen, Pelvic Organs, Whole Spine, Hip)',
            'B. Liver Fat Quantification by MRI (Advanced steatosis and hepatic lipid quantification)',
            'C. Brain Age Analysis by AI (Artificial intelligence volumetric comparison of neurological vs biological age)',
            'D. Angiogram (Neck & Brain non-invasive magnetic resonance angiography)',
            'E. Visceral Fat Quantification (Clinical quantification of deep organ adipose tissue)',
            'F. Special Blood Tests (Insulin, IgE, CRP)',
            'G. 3 Free Smart Reports: 1. Health Score, 2. Nutrition Plan, 3. Health Trends',
        ]),
        'benefits' => json_encode([
            'Whole body anatomical visualization without ionizing radiation',
            'AI-guided biological brain age determination',
            'High-precision hepatic and visceral fat percentage calculation',
            '3D non-invasive vascular angiogram of neck and cerebral vessels',
            'Three actionable longevity and nutrition smart reports',
        ]),
        'instructions' => '10–12 hours fasting required. Plan for 4 to 6 hours at the diagnostic facility. Remove all metal objects.',
        'preparation_guidelines' => "• 10–12 hours overnight fasting.\n• Do not apply metallic cosmetics or wear clothing with metal zippers.\n• Inform technicians if you have an intraocular metal fragment, aneurysm clip, or pacemaker.\n• Water intake is allowed.",
        'included_services' => json_encode(['Vital Full Body MRI', 'AI Brain Age Analysis', 'Angiograms', 'Fat Quantification', 'All Platinum Tests', '3 Smart Reports', 'Senior Physician Review']),
        'excluded_services' => json_encode(['Medication dispensing', 'Emergency procedures']),
        'cancellation_policy' => 'Free cancellation and date rescheduling up to 48 hours prior to checkup.',
        'is_active' => 1,
        'is_published' => 1,
        'display_order' => 4,
        'assessments' => [
            [
                'title' => 'A. Vital Full Body MRI Scan (8 Screening Areas)',
                'subtitle' => 'Comprehensive multi-region magnetic resonance screening',
                'description' => 'Systematic radiological examination of all primary body cavities and structural joints.',
                'icon' => 'Layers',
                'display_order' => 1,
                'tests' => [
                    ['test_name' => 'MRI Brain', 'description' => 'High-resolution screening of cerebral parenchyma, ventricles, and neurovascular structures.'],
                    ['test_name' => 'MRI PNS', 'description' => 'Paranasal sinus air spaces and mucosal lining.'],
                    ['test_name' => 'MRI Neck', 'description' => 'Soft tissues, pharyngeal anatomy, and cervical lymph nodes.'],
                    ['test_name' => 'MRI Chest', 'description' => 'Thoracic anatomy, mediastinum, pleural spaces, and pulmonary fields.'],
                    ['test_name' => 'MRI Abdomen', 'description' => 'Liver, gallbladder, spleen, pancreas, kidneys, and retroperitoneum.'],
                    ['test_name' => 'MRI Pelvic Organs', 'description' => 'Bladder, prostate in men, uterus and adnexa in women.'],
                    ['test_name' => 'Whole Spine MRI', 'description' => 'Complete cervical, thoracic, and lumbosacral vertebral and spinal cord evaluation.'],
                    ['test_name' => 'MRI Hip', 'description' => 'Femoral heads, acetabular joints, and pelvic muscular girdle.'],
                ],
            ],
            [
                'title' => 'B. Liver Fat Quantification by MRI',
                'subtitle' => 'Advanced non-invasive magnetic resonance assessment',
                'description' => 'Measures proton density fat fraction (PDFF) in liver tissue to grade hepatic steatosis without a biopsy.',
                'icon' => 'Activity',
                'display_order' => 2,
                'tests' => [
                    ['test_name' => 'Liver Fat Quantification by MRI', 'description' => 'Quantitative MRI determination of liver fat percentage for early detection of metabolic associated steatotic liver disease.'],
                ],
            ],
            [
                'title' => 'C. Brain Age Analysis by AI',
                'subtitle' => 'Volumetric neuro-imaging AI model',
                'description' => 'Advanced machine-learning volumetric analysis comparing brain structure against extensive normative databases.',
                'icon' => 'Zap',
                'display_order' => 3,
                'tests' => [
                    ['test_name' => 'Brain Age Analysis by AI', 'description' => 'Determines biological brain age versus chronological age, tracking neuro-cognitive vitality and subtle atrophy.'],
                ],
            ],
            [
                'title' => 'D. Angiogram (Neck & Brain)',
                'subtitle' => 'Non-invasive Magnetic Resonance Angiography',
                'description' => 'Visualizes vascular flow dynamics and arterial lumen diameter without arterial catheterization.',
                'icon' => 'TrendingUp',
                'display_order' => 4,
                'tests' => [
                    ['test_name' => 'Angiogram – Neck', 'description' => 'MRA screening of bilateral carotid and vertebral arteries.'],
                    ['test_name' => 'Angiogram – Brain', 'description' => 'Intracranial 3D Time-of-Flight MRA examining the Circle of Willis, aneurysms, and vascular occlusions.'],
                ],
            ],
            [
                'title' => 'E. Visceral Fat Quantification',
                'subtitle' => 'Deep abdominal adipose tissue calculation',
                'description' => 'Accurate measurement of intra-abdominal fat surrounding vital internal organs.',
                'icon' => 'Shield',
                'display_order' => 5,
                'tests' => [
                    ['test_name' => 'Visceral Fat Quantification', 'description' => 'Measures deep visceral adipose tissue (VAT) linked to systemic inflammation and cardiovascular disease.'],
                ],
            ],
            [
                'title' => 'F. Special Blood Tests',
                'subtitle' => 'Advanced metabolic & allergic biomarkers',
                'description' => 'Key biomarkers for insulin resistance and systemic inflammation.',
                'icon' => 'Droplet',
                'display_order' => 6,
                'tests' => [
                    ['test_name' => 'Insulin (F)', 'description' => 'Fasting blood insulin level.'],
                    ['test_name' => 'IgE', 'description' => 'Total Immunoglobulin E allergy marker.'],
                    ['test_name' => 'CRP', 'description' => 'C-Reactive Protein inflammatory index.'],
                ],
            ],
            [
                'title' => 'G. Free Smart Tests / Reports (3 Included)',
                'subtitle' => 'Actionable clinical health intelligence',
                'description' => 'Three comprehensive digital intelligence reports included at no additional charge.',
                'icon' => 'FileText',
                'display_order' => 7,
                'tests' => [
                    ['test_name' => 'Health Score', 'description' => 'Overall composite clinical score synthesizing cardiac, metabolic, and organ function.'],
                    ['test_name' => 'Nutrition Plan', 'description' => 'Personalized dietitian-backed nutrition and dietary plan based on diagnostic findings.'],
                    ['test_name' => 'Health Trends', 'description' => 'Long-term risk trajectories and lifestyle optimization tracking.'],
                ],
            ],
            [
                'title' => 'Inherited Foundation: All Jana Seva Platinum Tests',
                'subtitle' => 'Complete Gold, Diamond & Platinum Diagnostic Spectrum',
                'description' => 'Includes 4 Radiology tests, 3 Cancer markers, full CBC, comprehensive organ profiles, CT Brain, CT PNS, MRI Spine, and Carotid Doppler.',
                'icon' => 'CheckCircle',
                'display_order' => 8,
                'tests' => [
                    ['test_name' => 'Full Jana Seva Platinum Package (106+ Tests)', 'description' => 'Complete baseline including all Gold, Diamond, and Platinum diagnostics.'],
                ],
            ],
        ],
    ],

    // 5. APEX COMPREHENSIVE HEALTH CHECK (APEX PRO)
    [
        'title' => 'APEX Comprehensive Health Check',
        'slug' => 'apex-comprehensive-health-check',
        'category' => 'Precision Longevity & Performance',
        'short_description' => "India's most complete health evaluation designed by Vital Insights. Combines deep clinical imaging, metabolic intelligence and physiological performance testing.",
        'description' => "India's most complete health evaluation designed by Vital Insights. It combines deep clinical imaging, metabolic intelligence and physiological performance testing into a single precision-driven assessment. Detects hidden abnormalities, structural degeneration, inflammatory patterns and risk markers across 20+ conditions.",
        'duration' => '1–2 Days',
        'price' => 0.00,
        'market_price' => 0.00,
        'discount' => 'Price on Request',
        'test_count' => 'Full Body MRI + DEXA + Blood Pro (120+ Biomarkers) + VO2 Max + Strength Pro',
        'price_on_request' => 1,
        'currency' => 'INR',
        'location' => 'Chennai, Tamil Nadu',
        'featured_image' => '/uploads/media/medical_package_banner.jpg',
        'banner_title' => 'APEX PRO • Precision Longevity & Full Body Performance',
        'banner_subtitle' => "India's Most Complete Health Evaluation by Vital Insights",
        'banner_description' => 'Structural full body MRI, DEXA body composition & bone density, 120+ Blood Pro biomarkers, VO₂ Max aerobic performance, Strength Pro biomechanics, and Resting Metabolic Rate.',
        'banner_image' => '/uploads/media/medical_package_banner.jpg',
        'highlights' => json_encode([
            'A. Full Body MRI: Structural assessment covering 20 anatomical regions',
            'B. DEXA Scan: Body Composition & Bone Mineral Density',
            'C. Blood Pro: 120+ Blood Biomarkers across 8 clinical categories',
            'D. VO2 Max Test: Aerobic performance and cardiovascular fitness age',
            'E. Strength Pro Assessment: Upper & lower body biomechanics and symmetry',
            'F. Resting Metabolic Rate (RMR): Baseline calorie expenditure and efficiency',
            'G. 6 Included Reports: Longevity, Biological Age, Body Composition, Early Disease, Organ Summary, Metabolic Score',
            'H. Proactive screening across 20+ medical conditions',
        ]),
        'benefits' => json_encode([
            'Total structural mapping of brain, spine, organs, and musculoskeletal system',
            'Gold-standard DEXA total body fat, visceral fat (VAT), and T-Score bone density',
            'Cardiopulmonary exercise testing (CPET) determining VO₂ Max and lactate zones',
            'Advanced biomechanical force asymmetry and muscle power profiling',
            'Resting metabolic calorimetry calculating exact daily calorie burn',
        ]),
        'instructions' => '10–12 hours fasting required. Bring athletic clothing and running shoes for VO2 Max and Strength Pro testing.',
        'preparation_guidelines' => "• 10–12 hours overnight fasting for blood biomarkers.\n• Avoid strenuous exercise 24 hours prior to testing.\n• Bring athletic workout clothes and running shoes for VO2 Max and Strength Pro assessments.\n• Avoid caffeine, pre-workout supplements, and alcohol for 24 hours.\n• Water intake is permitted.",
        'included_services' => json_encode(['Full Body MRI', 'DEXA Scan', 'Blood Pro (120+ Biomarkers)', 'VO2 Max Test', 'Strength Pro', 'RMR Test', '6 Longevity Reports', 'Multidisciplinary Physician Review']),
        'excluded_services' => json_encode(['Inpatient hospitalization', 'Prescription drugs']),
        'cancellation_policy' => 'Flexible rescheduling up to 48 hours prior to test schedule.',
        'is_active' => 1,
        'is_published' => 1,
        'display_order' => 5,
        'assessments' => [
            [
                'title' => 'A. Full Body MRI (Structural Assessment)',
                'subtitle' => 'Deep clinical imaging detecting hidden diseases throughout the body',
                'description' => 'Evaluates 20 anatomical regions to identify early structural degeneration, inflammatory patterns, abnormalities, and risk markers without ionizing radiation.',
                'icon' => 'Layers',
                'display_order' => 1,
                'tests' => [
                    ['test_name' => 'Brain & Intracranial Structures', 'description' => 'Evaluates cerebral parenchyma, white matter changes, and stroke risk.'],
                    ['test_name' => 'Spine (Cervical, Thoracic & Lumbar)', 'description' => 'Comprehensive disc, cord, and vertebral column alignment.'],
                    ['test_name' => 'Head & Neck', 'description' => 'Soft tissues, pharyngeal anatomy, and salivary/thyroid glands.'],
                    ['test_name' => 'Chest / Lungs', 'description' => 'Thoracic cavity, mediastinum, and lung parenchymal screening.'],
                    ['test_name' => 'Heart (Structural)', 'description' => 'Cardiac chamber geometry, pericardium, and gross structural integrity.'],
                    ['test_name' => 'Liver & Gallbladder', 'description' => 'Hepatic architecture, steatosis, biliary ducts, and gallbladder.'],
                    ['test_name' => 'Pancreas & Spleen', 'description' => 'Pancreatic parenchyma, ductal dilation, and splenic size.'],
                    ['test_name' => 'Kidneys & Adrenal Glands', 'description' => 'Renal parenchyma, corticomedullary differentiation, and adrenal morphology.'],
                    ['test_name' => 'Urinary Bladder & Pelvic Cavity', 'description' => 'Bladder wall thickness, pelvic floor, and lymph nodes.'],
                    ['test_name' => 'Prostate (Men) / Pelvic Organs (Women)', 'description' => 'Prostate zonal anatomy in men; uterus, endometrium, and ovaries in women.'],
                    ['test_name' => 'Blood Vessels (Major Vascular Tree)', 'description' => 'Aortic caliber, major branching, and vascular abnormalities.'],
                    ['test_name' => 'Bones, Muscles & Soft Tissues', 'description' => 'Structural integrity of musculoskeletal and soft tissue compartments.'],
                    ['test_name' => 'Joint Abnormalities & Alignment', 'description' => 'Large joint articulation, cartilage status, and effusion.'],
                    ['test_name' => 'Tumour / Cancer Screening', 'description' => 'Systematic oncological search for occult masses or lesions.'],
                    ['test_name' => 'Stroke-related Findings', 'description' => 'Detection of silent lacunar infarcts, micro-bleeds, or white matter hyperintensities.'],
                ],
            ],
            [
                'title' => 'B. DEXA Scan – Body Composition & Bone Density',
                'subtitle' => 'Dual-Energy X-Ray Absorptiometry',
                'description' => 'Gold-standard physiological assessment of body composition, visceral adipose tissue, and skeletal bone mineral density.',
                'icon' => 'Activity',
                'display_order' => 2,
                'tests' => [
                    ['test_name' => 'Body Composition: Total Body Fat (%)', 'description' => 'Precise measurement of total systemic adipose percentage.'],
                    ['test_name' => 'Regional Body Fat (Trunk, Arm & Leg Fat)', 'description' => 'Segmental fat distribution across upper body, trunk, and lower extremities.'],
                    ['test_name' => 'Android / Gynoid Fat Ratio', 'description' => 'Central abdominal versus hip fat ratio assessing cardiovascular risk.'],
                    ['test_name' => 'Visceral Adipose Tissue (VAT)', 'description' => 'Quantifies intra-abdominal visceral fat surrounding internal organs.'],
                    ['test_name' => 'Lean Muscle Mass & Skeletal Muscle Mass', 'description' => 'Accurate measurement of functional metabolic muscle mass.'],
                    ['test_name' => 'Fat-Free Mass Index (FFMI)', 'description' => 'Standardized index of lean muscle relative to height.'],
                    ['test_name' => 'Bone Mineral Density (BMD)', 'description' => 'Gold-standard skeletal mineral density assessment.'],
                    ['test_name' => 'T-Score & Z-Score', 'description' => 'Statistical comparison against peak young adult and age-matched norms.'],
                    ['test_name' => 'Osteopenia & Osteoporosis Risk', 'description' => 'Clinical risk stratification for bone fragility and fracture susceptibility.'],
                ],
            ],
            [
                'title' => 'C. Blood Pro – 120+ Blood Biomarkers',
                'subtitle' => 'Comprehensive multi-system blood evaluation',
                'description' => 'Client-supplied categories covering cardiovascular, metabolic, hepatic, renal, hormonal, and nutritional pathways.',
                'icon' => 'Droplet',
                'display_order' => 3,
                'tests' => [
                    ['test_name' => 'Cardiovascular & Lipid Profile', 'description' => 'Cholesterol, Triglycerides, HDL, LDL, VLDL, and cardiac risk markers.'],
                    ['test_name' => 'Diabetes & Metabolism', 'description' => 'Blood Sugar, HbA1c, and Insulin Resistance markers.'],
                    ['test_name' => 'Liver Function', 'description' => 'SGOT (AST), SGPT (ALT), Bilirubin, Albumin, Alkaline Phosphatase.'],
                    ['test_name' => 'Kidney Function', 'description' => 'Creatinine, Urea, Uric Acid, eGFR filtration rate.'],
                    ['test_name' => 'Thyroid & Hormones', 'description' => 'T3, T4, TSH, and comprehensive hormonal profile.'],
                    ['test_name' => 'Vitamins & Minerals', 'description' => 'Vitamin D, Vitamin B12, Iron Studies, Calcium, Magnesium.'],
                    ['test_name' => 'Inflammation Markers', 'description' => 'CRP, ESR, and systemic inflammatory markers.'],
                    ['test_name' => 'Blood Health (CBC)', 'description' => 'Complete Blood Count (CBC), Hemoglobin, White Blood Cells, Platelets.'],
                ],
            ],
            [
                'title' => 'D. VO2 Max Test – Aerobic Performance',
                'subtitle' => 'Cardiopulmonary exercise testing (CPET)',
                'description' => 'Direct measurement of oxygen uptake capacity during progressive exercise to assess cardiorespiratory fitness and biological age.',
                'icon' => 'TrendingUp',
                'display_order' => 4,
                'tests' => [
                    ['test_name' => 'VO2 Max Score & Fitness Age', 'description' => 'Maximum volume of oxygen utilized during maximal exertion and biological cardiopulmonary age.'],
                    ['test_name' => 'Aerobic Capacity & Aerobic Ceiling', 'description' => 'Upper threshold of aerobic endurance.'],
                    ['test_name' => 'Fat Oxidation Zone (FatMax)', 'description' => 'Heart rate intensity where fat burning is optimized.'],
                    ['test_name' => 'Heart Rate Zones & Lactate Threshold Zone', 'description' => 'Individualized physiological training zones 1 through 5.'],
                    ['test_name' => 'Endurance Capacity & Recovery Score', 'description' => 'Rate of heart rate recovery following peak exertion.'],
                    ['test_name' => 'Heart Rate Variability (HRV)', 'description' => 'Autonomic nervous system resilience and parasympathetic tone.'],
                ],
            ],
            [
                'title' => 'E. Strength Pro Assessment',
                'subtitle' => 'Biomechanical force and muscular symmetry profiling',
                'description' => 'Comprehensive upper body, lower body, and dynamic power assessments using force plates and dynamometry.',
                'icon' => 'Shield',
                'display_order' => 5,
                'tests' => [
                    ['test_name' => 'Upper Body: Mid-Thigh Pull & Arm Strength', 'description' => 'Measures peak force in Mid-Thigh Pull, Biceps, Triceps, and Forearm.'],
                    ['test_name' => 'Rotator Cuff: Infraspinatus & Subscapularis', 'description' => 'Shoulder stabilization strength and rotator cuff balance.'],
                    ['test_name' => 'Lower Body: Hamstrings, Quads & Adductors', 'description' => 'Quadriceps to hamstring strength ratio and adductor magnus power.'],
                    ['test_name' => 'Pelvic Stabilizers: Gluteus Medius & TFL', 'description' => 'Hip abduction stability and gait biomechanics.'],
                    ['test_name' => 'Counter Movement Jump (CMJ) & Explosive Power', 'description' => 'Force vs. time analysis and vertical jump power generation.'],
                    ['test_name' => 'Left–Right Strength Asymmetry & Injury Risk', 'description' => 'Bilateral deficit quantification and injury predisposition assessment.'],
                ],
            ],
            [
                'title' => 'F. Resting Metabolic Rate (RMR)',
                'subtitle' => 'Indirect calorimetry metabolic testing',
                'description' => 'Measures oxygen consumption and carbon dioxide production at complete physical rest to determine baseline caloric requirements.',
                'icon' => 'Flame',
                'display_order' => 6,
                'tests' => [
                    ['test_name' => 'Resting Metabolic Rate & Basal Energy Expenditure', 'description' => 'Precise baseline calories burned per day at rest.'],
                    ['test_name' => 'Daily Calorie Requirement & Metabolic Efficiency', 'description' => 'Exact daily caloric intake needed for maintenance, weight loss, or performance.'],
                ],
            ],
            [
                'title' => 'G. Included Reports & H. Conditions Screened',
                'subtitle' => 'Clinical intelligence & 20+ disease screening areas',
                'description' => 'Actionable diagnostic longevity reports and screening for early detection across major chronic diseases.',
                'icon' => 'FileText',
                'display_order' => 7,
                'tests' => [
                    ['test_name' => 'Longevity Report & Biological Age', 'description' => 'Calculates biological vs chronological age based on multimodality imaging and biomarkers.'],
                    ['test_name' => 'Body Composition & Organ Summary Report', 'description' => 'Detailed multi-system clinical summary with organ-by-organ status.'],
                    ['test_name' => 'Early Disease Detection (20+ Conditions)', 'description' => 'Screens for Thyroid disorders, Hormonal disorders, Brain/Memory disorders, Heart disease, Stroke risk, Liver disease, Spine/Joint disorders, Osteopenia/Osteoporosis, Cancer markers, Metabolic syndrome, and Diabetes.'],
                ],
            ],
        ],
    ],

    // 6. VITAL BLOOD ELITE – MEN
    [
        'title' => 'Vital Blood Elite – Men',
        'slug' => 'vital-blood-elite-men',
        'category' => 'Men\'s Health Diagnostics',
        'short_description' => 'The definitive 133-biomarker blood assessment engineered specifically for men. Analyzes hormones, cardiovascular risk, liver, kidneys, and cellular health.',
        'description' => 'Vital Blood Elite – Men is a comprehensive diagnostic mapping of 133 biomarkers covering hematology, male hormonal profile (Total & Free Testosterone, SHBG, DHEA-S), cardiac inflammation (ApoB, Lp(a), hsCRP), cancer screening (PSA, CEA, CA 19-9), and organ vitality.',
        'duration' => '1 Day',
        'price' => 0.00,
        'market_price' => 0.00,
        'discount' => 'Price on Request',
        'test_count' => '133 Biomarkers',
        'price_on_request' => 1,
        'currency' => 'INR',
        'location' => 'Chennai, Tamil Nadu',
        'featured_image' => '/uploads/media/medical_blood_pro.jpg',
        'banner_title' => 'Vital Blood Elite – Men • 133 Biomarker Health Mapping',
        'banner_subtitle' => 'Comprehensive Biomarker Diagnostics Specially Designed for Men',
        'banner_description' => 'Complete hematology, male hormonal health, cardiovascular lipid risk, liver fibrosis, renal filtration, and cancer screening markers.',
        'banner_image' => '/uploads/media/medical_blood_pro.jpg',
        'highlights' => json_encode([
            'Exact 133 client-specified biomarkers analyzed in accredited diagnostic labs',
            'Hematology – Complete Blood Count (29 parameters including Reticulocytes & Mentzer Index)',
            'Diabetes & Insulin: Fasting Glucose, HbA1c, Fasting Insulin, HOMA-IR, TyG Index',
            'Lipid Profile (14 parameters including ApoB, ApoA1, and Lipoprotein(a))',
            'Male Hormones: Total & Free Testosterone, SHBG, Free Androgen Index, DHEA-S, Estradiol, Cortisol',
            'Cancer Markers: PSA Total, CEA, CA 19-9',
            'Liver, Kidney, Thyroid, Vitamins, Electrolytes, and 20 Urine Analysis parameters',
            '10–12 hours fasting required. Water is allowed.',
        ]),
        'benefits' => json_encode([
            'Comprehensive male hormonal profiling detecting hypogonadism or andropause',
            'Cutting-edge cardiovascular assessment with Apolipoprotein B and Lipoprotein(a)',
            'Insulin resistance quantification via HOMA-IR before diabetes manifests',
            'Prostate and gastrointestinal cancer screening biomarkers',
        ]),
        'instructions' => '10–12 hours fasting. Water is allowed. Avoid strenuous workouts on morning of test.',
        'preparation_guidelines' => "• 10–12 hours fasting required prior to blood draw.\n• Water intake is allowed and encouraged.\n• Avoid heavy resistance training 24 hours prior to prevent transient enzyme elevations.\n• Collect morning sample before 10:00 AM for optimal testosterone evaluation.",
        'included_services' => json_encode(['133 Biomarkers Lab Testing', 'Doctor Clinical Review', 'Digital Lab Report']),
        'excluded_services' => json_encode(['Imaging Scans', 'Hospital Stay']),
        'cancellation_policy' => 'Free appointment rescheduling up to 24 hours prior.',
        'is_active' => 1,
        'is_published' => 1,
        'display_order' => 6,
        'assessments' => [
            [
                'title' => 'Hematology – CBC (29 Biomarkers)',
                'subtitle' => 'Complete automated cellular hematology',
                'description' => 'Comprehensive 29-parameter blood count analyzing cellular elements and indices.',
                'icon' => 'Activity',
                'display_order' => 1,
                'tests' => [
                    ['test_name' => 'Total WBC Count'], ['test_name' => 'RBC Count'], ['test_name' => 'Haemoglobin'],
                    ['test_name' => 'PCV (Haematocrit)'], ['test_name' => 'MCV'], ['test_name' => 'MCH'], ['test_name' => 'MCHC'],
                    ['test_name' => 'RDW-SD'], ['test_name' => 'RDW-CV'], ['test_name' => 'PDW'], ['test_name' => 'MPV'],
                    ['test_name' => 'Platelet Count'], ['test_name' => 'Neutrophils'], ['test_name' => 'Lymphocytes'],
                    ['test_name' => 'Eosinophils'], ['test_name' => 'Monocytes'], ['test_name' => 'Basophils'],
                    ['test_name' => 'Immature Granulocyte %'], ['test_name' => 'Absolute Neutrophil Count'],
                    ['test_name' => 'Absolute Lymphocyte Count'], ['test_name' => 'Absolute Eosinophil Count'],
                    ['test_name' => 'Absolute Monocyte Count'], ['test_name' => 'Absolute Basophil Count'],
                    ['test_name' => 'Neutrophil–Lymphocyte Ratio'], ['test_name' => 'Reticulocyte Count'],
                    ['test_name' => 'Plateletcrit (PCT)'], ['test_name' => 'P-LCR'], ['test_name' => 'ESR'],
                    ['test_name' => 'Mentzer Index']
                ],
            ],
            [
                'title' => 'Diabetes & Insulin (8 Biomarkers)',
                'subtitle' => 'Insulin resistance and glycemic balance',
                'description' => 'In-depth evaluation of glucose handling and pancreatic beta cell function.',
                'icon' => 'TrendingUp',
                'display_order' => 2,
                'tests' => [
                    ['test_name' => 'Fasting Glucose'], ['test_name' => 'HbA1c'], ['test_name' => 'Mean Blood Glucose'],
                    ['test_name' => 'Fasting Insulin'], ['test_name' => 'HOMA-IR (Insulin Resistance)'],
                    ['test_name' => 'Insulin Sensitivity'], ['test_name' => 'Beta Cell Function'], ['test_name' => 'TyG Index']
                ],
            ],
            [
                'title' => 'Lipid Profile (14 Biomarkers)',
                'subtitle' => 'Advanced lipoprotein & atherogenic particles',
                'description' => 'Extended lipid panel including apolipoproteins and atherogenic particle ratios.',
                'icon' => 'Heart',
                'display_order' => 3,
                'tests' => [
                    ['test_name' => 'Total Cholesterol'], ['test_name' => 'LDL'], ['test_name' => 'HDL'], ['test_name' => 'VLDL'],
                    ['test_name' => 'Non-HDL Cholesterol'], ['test_name' => 'Triglycerides'], ['test_name' => 'Cholesterol/HDL Ratio'],
                    ['test_name' => 'LDL/HDL Ratio'], ['test_name' => 'TG/HDL Ratio'], ['test_name' => 'Apolipoprotein B'],
                    ['test_name' => 'Apolipoprotein A1'], ['test_name' => 'ApoB/ApoA1 Ratio'], ['test_name' => 'Remnant Cholesterol'],
                    ['test_name' => 'Lipoprotein(a)']
                ],
            ],
            [
                'title' => 'Liver Function (13 Biomarkers)',
                'subtitle' => 'Hepatic enzymes, clearance & FIB-4 fibrosis score',
                'description' => 'Comprehensive liver panel evaluating inflammation, synthetic capacity, and fibrosis.',
                'icon' => 'Layers',
                'display_order' => 4,
                'tests' => [
                    ['test_name' => 'AST (SGOT)'], ['test_name' => 'ALT (SGPT)'], ['test_name' => 'AST/ALT Ratio'],
                    ['test_name' => 'Alkaline Phosphatase'], ['test_name' => 'Gamma GT'], ['test_name' => 'Total Protein'],
                    ['test_name' => 'Albumin'], ['test_name' => 'Globulin'], ['test_name' => 'A/G Ratio'],
                    ['test_name' => 'Bilirubin Total'], ['test_name' => 'Bilirubin Direct'], ['test_name' => 'Bilirubin Indirect'],
                    ['test_name' => 'FIB-4 Score']
                ],
            ],
            [
                'title' => 'Kidney Function (10 Biomarkers)',
                'subtitle' => 'Glomerular filtration & Cystatin-C accuracy',
                'description' => 'Combines traditional creatinine with Cystatin-C for superior renal filtration evaluation.',
                'icon' => 'Droplet',
                'display_order' => 5,
                'tests' => [
                    ['test_name' => 'Creatinine'], ['test_name' => 'Urea'], ['test_name' => 'BUN'], ['test_name' => 'Uric Acid'],
                    ['test_name' => 'eGFR (Creatinine)'], ['test_name' => 'Cystatin-C'], ['test_name' => 'eGFR (Cystatin-C)'],
                    ['test_name' => 'Microalbumin/Creatinine Ratio'], ['test_name' => 'Spot Urine Creatinine'],
                    ['test_name' => 'Urine Microalbumin']
                ],
            ],
            [
                'title' => 'Thyroid Panel (5 Biomarkers)',
                'subtitle' => 'Hormones and autoimmune antibodies',
                'description' => 'Evaluates active thyroid hormones and autoimmune Hashimoto antibodies.',
                'icon' => 'Sun',
                'display_order' => 6,
                'tests' => [
                    ['test_name' => 'TSH (Ultra)'], ['test_name' => 'Free T3'], ['test_name' => 'Free T4'],
                    ['test_name' => 'Anti-TPO'], ['test_name' => 'Anti-Thyroglobulin Antibody']
                ],
            ],
            [
                'title' => 'Cardiovascular & Inflammation (6 Biomarkers)',
                'subtitle' => 'Vascular and tissue inflammatory enzymes',
                'description' => 'Measures high-sensitivity vascular inflammation and cardiac cellular enzymes.',
                'icon' => 'AlertCircle',
                'display_order' => 7,
                'tests' => [
                    ['test_name' => 'hsCRP'], ['test_name' => 'Homocysteine'], ['test_name' => 'Lipase'],
                    ['test_name' => 'Amylase'], ['test_name' => 'CPK'], ['test_name' => 'LDH']
                ],
            ],
            [
                'title' => 'Vitamins & Minerals (11 Biomarkers)',
                'subtitle' => 'Micronutrient reserves & iron metabolism',
                'description' => 'Measures cellular mineral saturation, iron stores, and essential vitamin cofactors.',
                'icon' => 'CheckCircle',
                'display_order' => 8,
                'tests' => [
                    ['test_name' => 'Vitamin B12'], ['test_name' => 'Vitamin D (25-OH)'], ['test_name' => 'Folate'],
                    ['test_name' => 'Calcium'], ['test_name' => 'Phosphorus'], ['test_name' => 'Magnesium'],
                    ['test_name' => 'Iron'], ['test_name' => 'TIBC'], ['test_name' => 'Ferritin'],
                    ['test_name' => 'Transferrin Saturation'], ['test_name' => 'Zinc']
                ],
            ],
            [
                'title' => 'Electrolytes (4 Biomarkers)',
                'subtitle' => 'Hydration and osmotic balance',
                'description' => 'Serum electrolyte balance fundamental for cardiovascular conduction and cellular homeostasis.',
                'icon' => 'Shield',
                'display_order' => 9,
                'tests' => [
                    ['test_name' => 'Sodium'], ['test_name' => 'Potassium'], ['test_name' => 'Chloride'], ['test_name' => 'Bicarbonate']
                ],
            ],
            [
                'title' => 'Male Hormones (9 Biomarkers)',
                'subtitle' => 'Endocrine and andrological vitality',
                'description' => 'Comprehensive evaluation of testosterone bio-availability, adrenal output, and pituitary control.',
                'icon' => 'Zap',
                'display_order' => 10,
                'tests' => [
                    ['test_name' => 'Total Testosterone'], ['test_name' => 'Free Testosterone'], ['test_name' => 'SHBG'],
                    ['test_name' => 'Free Androgen Index'], ['test_name' => 'Estradiol (E2)'], ['test_name' => 'DHEA-S'],
                    ['test_name' => 'FSH'], ['test_name' => 'Prolactin'], ['test_name' => 'Cortisol (AM)']
                ],
            ],
            [
                'title' => 'Specialty & Cancer Markers (4 Biomarkers)',
                'subtitle' => 'Immunological and oncological screening',
                'description' => 'Screening for prostate, gastrointestinal, and pan-colonic tumor antigens.',
                'icon' => 'FileText',
                'display_order' => 11,
                'tests' => [
                    ['test_name' => 'Total IgE'], ['test_name' => 'PSA – Total'], ['test_name' => 'CEA'], ['test_name' => 'CA 19-9']
                ],
            ],
            [
                'title' => 'Urine Analysis (20 Parameters)',
                'subtitle' => 'Urinary excretion and sediment microscopy',
                'description' => '20 specific biochemical and microscopic urinary parameters.',
                'icon' => 'Database',
                'display_order' => 12,
                'tests' => [
                    ['test_name' => 'Colour'], ['test_name' => 'Clarity'], ['test_name' => 'pH'], ['test_name' => 'Specific Gravity'],
                    ['test_name' => 'Protein'], ['test_name' => 'Glucose'], ['test_name' => 'Ketone'],
                    ['test_name' => 'Bile Pigment & Salt'], ['test_name' => 'Urobilinogen'], ['test_name' => 'Nitrite'],
                    ['test_name' => 'Blood'], ['test_name' => 'Pus Cells'], ['test_name' => 'Epithelial Cells'],
                    ['test_name' => 'RBCs'], ['test_name' => 'Crystals'], ['test_name' => 'Hyaline Casts'],
                    ['test_name' => 'Pathological Cast'], ['test_name' => 'Yeast'], ['test_name' => 'Mucus'], ['test_name' => 'Bacteria']
                ],
            ],
        ],
    ],

    // 7. VITAL BLOOD PRO WOMEN UNDER 50
    [
        'title' => 'Vital Blood Pro Women Under 50',
        'slug' => 'vital-blood-pro-women-under-50',
        'category' => 'Women\'s Health Diagnostics',
        'short_description' => 'Tailored 127-test clinical biomarker profile addressing female hormonal cycles, AMH ovarian reserve, thyroid, iron saturation, cardiovascular risk, and cellular health.',
        'description' => 'Vital Blood Pro Women Under 50 provides deep diagnostic insight into female physiological health. Features AMH (Anti-Mullerian Hormone), Estrogen/Testosterone balance, Thyroid antibodies, detailed Iron studies, and comprehensive organ vitality.',
        'duration' => '1 Day',
        'price' => 0.00,
        'market_price' => 0.00,
        'discount' => 'Price on Request',
        'test_count' => '127 Tests',
        'price_on_request' => 1,
        'currency' => 'INR',
        'location' => 'Chennai, Tamil Nadu',
        'featured_image' => '/uploads/media/medical_blood_pro.jpg',
        'banner_title' => 'Vital Blood Pro Women Under 50 • 127 Clinical Tests',
        'banner_subtitle' => 'Specialized Diagnostic Panel for Female Hormonal & Cellular Health',
        'banner_description' => 'Complete hematology, female hormonal panel (AMH, Estrogen, Free Testosterone), thyroid autoimmunity, iron saturation, and organ wellness.',
        'banner_image' => '/uploads/media/medical_blood_pro.jpg',
        'highlights' => json_encode([
            'Exact 127 client-specified clinical tests preserving full laboratory detail',
            'Female Hormonal Profile: AMH (Anti-Mullerian Hormone), Testosterone, SHBG, DHEA-SO4, Cortisol, FSH, Prolactin',
            'Hematology / CBC (28 parameters including NLR, Reticulocytes, and ESR 1-Hour)',
            'Thyroid Autoimmunity: Free T4, Free T3, TSH Ultra, Anti-TPO, Anti-TG',
            'Iron Saturation: Iron, TIBC, Ferritin, Transferrin Saturation, RBC Magnesium',
            'Lipid & Cardiovascular: ApoB, Lp(a), hsCRP, Homocysteine, Lipid ratios',
            'Kidney, Liver, Diabetes, Electrolytes, Specialty enzymes, and 22 Urine Complete Analysis parameters',
            '10–12 hours fasting required. Water is allowed.',
        ]),
        'benefits' => json_encode([
            'Ovarian reserve evaluation via Anti-Mullerian Hormone (AMH)',
            'Complete iron panel identifying latent iron depletion before anemia occurs',
            'Thyroid autoimmune screening for Hashimoto or Grave antibodies',
            'Cardiovascular risk stratification designed for female physiology',
        ]),
        'instructions' => '10–12 hours fasting. Water is allowed. Advise physician regarding menstrual cycle day.',
        'preparation_guidelines' => "• 10–12 hours fasting prior to blood draw.\n• Water intake is allowed.\n• Note date of last menstrual period (LMP) for clinical correlation with hormonal levels.\n• Morning blood collection recommended for accurate cortisol and hormone evaluation.",
        'included_services' => json_encode(['127 Diagnostic Tests', 'Specialist Physician Review', 'Digital Lab Record']),
        'excluded_services' => json_encode(['Imaging Scans', 'Hospital Stay']),
        'cancellation_policy' => 'Free cancellation and rescheduling up to 24 hours prior to appointment.',
        'is_active' => 1,
        'is_published' => 1,
        'display_order' => 7,
        'assessments' => [
            [
                'title' => 'Hematology / CBC (28 Tests)',
                'subtitle' => 'Complete blood counts and cellular parameters',
                'description' => 'Hematological screening for anemia, immune defense, and bone marrow cellularity.',
                'icon' => 'Activity',
                'display_order' => 1,
                'tests' => [
                    ['test_name' => 'Absolute Eosinophil Count'], ['test_name' => 'Absolute Lymphocyte Count'],
                    ['test_name' => 'Absolute Neutrophil Count'], ['test_name' => 'Differential Count (DC)'],
                    ['test_name' => 'Neutrophils'], ['test_name' => 'Lymphocytes'], ['test_name' => 'Eosinophils'],
                    ['test_name' => 'Monocytes'], ['test_name' => 'Basophils'], ['test_name' => 'Haemoglobin (HB)'],
                    ['test_name' => 'MCH'], ['test_name' => 'MCHC'], ['test_name' => 'MCV'],
                    ['test_name' => 'PCV – Haematocrit'], ['test_name' => 'Platelet Count'], ['test_name' => 'RBC'],
                    ['test_name' => 'Total WBC Count'], ['test_name' => 'RDW-SD'], ['test_name' => 'RDW-CV'],
                    ['test_name' => 'PDW'], ['test_name' => 'MPV'],
                    ['test_name' => 'Immature Granulocyte Percentage (IG%)'], ['test_name' => 'Absolute Monocytes Count'],
                    ['test_name' => 'Absolute Basophils Count'], ['test_name' => 'Neutrophil to Lymphocyte Ratio (NLR)'],
                    ['test_name' => 'Reticulocyte Count'], ['test_name' => 'ESR'], ['test_name' => 'ESR 1 Hour']
                ],
            ],
            [
                'title' => 'Diabetes & Metabolism (4 Tests)',
                'subtitle' => 'Glycemic regulation and average sugar control',
                'description' => 'Fasting blood glucose, glycosylated hemoglobin, and mean circulating sugar level.',
                'icon' => 'TrendingUp',
                'display_order' => 2,
                'tests' => [
                    ['test_name' => 'Glucose Fasting (FBS)'], ['test_name' => 'Glycosylated HbA1c'],
                    ['test_name' => 'HbA1c'], ['test_name' => 'Mean Blood Glucose Level']
                ],
            ],
            [
                'title' => 'Kidney Function (7 Tests)',
                'subtitle' => 'Renal filtration, urea, and Cystatin-C accuracy',
                'description' => 'Measures clearance and glomerular filtration using both creatinine and Cystatin-C.',
                'icon' => 'Droplet',
                'display_order' => 3,
                'tests' => [
                    ['test_name' => 'Creatinine'], ['test_name' => 'Uric Acid'], ['test_name' => 'Urea'],
                    ['test_name' => 'Blood Urea Nitrogen (BUN)'], ['test_name' => 'Cystatin-C'],
                    ['test_name' => 'eGFR by Creatinine'], ['test_name' => 'eGFR (Cystatin-C Based)']
                ],
            ],
            [
                'title' => 'Bone & Minerals (2 Tests)',
                'subtitle' => 'Skeletal mineral foundation',
                'description' => 'Serum calcium and phosphorus essential for bone density and neuromuscular signaling.',
                'icon' => 'Shield',
                'display_order' => 4,
                'tests' => [
                    ['test_name' => 'Calcium'], ['test_name' => 'Phosphorus']
                ],
            ],
            [
                'title' => 'Lipid & Advanced Cardiovascular (13 Tests)',
                'subtitle' => 'Cholesterol fractions and vascular risk markers',
                'description' => 'Complete lipid panel augmented by Apolipoprotein B, Lipoprotein(a), hsCRP, and Homocysteine.',
                'icon' => 'Heart',
                'display_order' => 5,
                'tests' => [
                    ['test_name' => 'Cholesterol'], ['test_name' => 'LDL Cholesterol'], ['test_name' => 'Triglycerides'],
                    ['test_name' => 'VLDL Cholesterol'], ['test_name' => 'HDL Cholesterol'], ['test_name' => 'CHO / HDL Ratio'],
                    ['test_name' => 'LDL / HDL Ratio'], ['test_name' => 'Non-HDL Cholesterol'], ['test_name' => 'TGL / HDL Ratio'],
                    ['test_name' => 'Apolipoprotein B'], ['test_name' => 'Lipoprotein (a)'], ['test_name' => 'hsCRP'],
                    ['test_name' => 'Homocysteine']
                ],
            ],
            [
                'title' => 'Liver Function (12 Tests)',
                'subtitle' => 'Hepatic enzymes, protein synthesis & bilirubin',
                'description' => 'Evaluates liver cells, biliary excretion, and metabolic enzymes.',
                'icon' => 'Layers',
                'display_order' => 6,
                'tests' => [
                    ['test_name' => 'Albumin'], ['test_name' => 'Alkaline Phosphatase'], ['test_name' => 'Gamma GT'],
                    ['test_name' => 'Globulin'], ['test_name' => 'AST / SGOT'], ['test_name' => 'ALT / SGPT'],
                    ['test_name' => 'Total Protein'], ['test_name' => 'Bilirubin Total'], ['test_name' => 'Bilirubin Direct'],
                    ['test_name' => 'Bilirubin Indirect'], ['test_name' => 'A/G Ratio'], ['test_name' => 'AST / ALT']
                ],
            ],
            [
                'title' => 'Thyroid Panel (5 Tests)',
                'subtitle' => 'Thyroid hormones and autoimmune antibodies',
                'description' => 'Screens for thyroid dysfunction and autoimmune Hashimoto thyroiditis.',
                'icon' => 'Sun',
                'display_order' => 7,
                'tests' => [
                    ['test_name' => 'Free T4'], ['test_name' => 'TSH Ultra'], ['test_name' => 'Free T3'],
                    ['test_name' => 'Anti-TPO'], ['test_name' => 'Anti-TG']
                ],
            ],
            [
                'title' => 'Insulin Dynamics (3 Tests)',
                'subtitle' => 'Fasting insulin and beta cell sensitivity',
                'description' => 'Evaluates cellular insulin sensitivity and early metabolic syndrome.',
                'icon' => 'Zap',
                'display_order' => 8,
                'tests' => [
                    ['test_name' => 'Insulin (Fasting)'], ['test_name' => 'HOMA-IR'], ['test_name' => 'Beta Cell Function']
                ],
            ],
            [
                'title' => 'Vitamins, Minerals & RBC Stores (8 Tests)',
                'subtitle' => 'Nutritional reserves and iron saturation',
                'description' => 'Comprehensive iron panel, Vitamin D, Vitamin B12, and intracellular RBC Magnesium.',
                'icon' => 'CheckCircle',
                'display_order' => 9,
                'tests' => [
                    ['test_name' => 'Vitamin B12'], ['test_name' => 'Vitamin D Total 25(OH)'], ['test_name' => 'Iron'],
                    ['test_name' => 'TIBC'], ['test_name' => 'Ferritin'], ['test_name' => 'Transferrin Saturation'],
                    ['test_name' => 'Zinc'], ['test_name' => 'RBC Magnesium']
                ],
            ],
            [
                'title' => 'Specialty, Inflammation & Coagulation (6 Tests)',
                'subtitle' => 'Systemic enzymes and inflammatory cascade',
                'description' => 'Evaluates tissue enzymes, systemic allergy, pancreatic function, and fibrinogen.',
                'icon' => 'AlertCircle',
                'display_order' => 10,
                'tests' => [
                    ['test_name' => 'Immunoglobulin E (Total IgE)'], ['test_name' => 'Lipase'],
                    ['test_name' => 'Amylase'], ['test_name' => 'CPK'], ['test_name' => 'LDH'], ['test_name' => 'Fibrinogen']
                ],
            ],
            [
                'title' => 'Female Hormones & Ovarian Reserve (8 Tests)',
                'subtitle' => 'Endocrine profile and reproductive health',
                'description' => 'Evaluates ovarian reserve (AMH), androgen balance, adrenal output, and pituitary control.',
                'icon' => 'Heart',
                'display_order' => 11,
                'tests' => [
                    ['test_name' => 'Testosterone – Total'], ['test_name' => 'Free Testosterone'], ['test_name' => 'SHBG'],
                    ['test_name' => 'DHEA-SO4'], ['test_name' => 'Cortisol (AM)'],
                    ['test_name' => 'Anti-Mullerian Hormone (AMH)'], ['test_name' => 'FSH'], ['test_name' => 'Prolactin']
                ],
            ],
            [
                'title' => 'Urine & Additional Renal Excretion (3 Tests)',
                'subtitle' => 'Renal microalbuminuria screening',
                'description' => 'Early detection of glomerular permeability changes.',
                'icon' => 'Droplet',
                'display_order' => 12,
                'tests' => [
                    ['test_name' => 'Microalbumin / Creatinine Ratio'], ['test_name' => 'Creatinine – Spot Urine'],
                    ['test_name' => 'Micro Albumin – Urine']
                ],
            ],
            [
                'title' => 'Urine Complete Analysis - CUE (22 Tests)',
                'subtitle' => 'Physical, chemical and microscopic parameters',
                'description' => 'Full automated and microscopic urinary evaluation.',
                'icon' => 'Database',
                'display_order' => 13,
                'tests' => [
                    ['test_name' => 'Colour'], ['test_name' => 'pH'], ['test_name' => 'Specific Gravity'],
                    ['test_name' => 'Protein'], ['test_name' => 'Glucose – Urine (Fasting)'],
                    ['test_name' => 'Bile Pigment & Bile Salt'], ['test_name' => 'Ketone'], ['test_name' => 'Urobilinogen'],
                    ['test_name' => 'Pus Cells'], ['test_name' => 'Epithelial Cells'], ['test_name' => 'RBCs'],
                    ['test_name' => 'Crystals'], ['test_name' => 'Hyaline Casts'], ['test_name' => 'Clarity'],
                    ['test_name' => 'Physical Examination'], ['test_name' => 'Microscopic Examination'],
                    ['test_name' => 'Chemical Examination'], ['test_name' => 'Yeast'], ['test_name' => 'Mucus'],
                    ['test_name' => 'Bacteria'], ['test_name' => 'Nitrite'], ['test_name' => 'Pathological Cast'],
                    ['test_name' => 'Blood']
                ],
            ],
            [
                'title' => 'Electrolytes (3 Tests)',
                'subtitle' => 'Fluid and electrolyte balance',
                'description' => 'Serum sodium, chloride, and bicarbonate concentration.',
                'icon' => 'Shield',
                'display_order' => 14,
                'tests' => [
                    ['test_name' => 'Sodium'], ['test_name' => 'Chloride'], ['test_name' => 'Bicarbonate']
                ],
            ],
        ],
    ],
];

// Seed packages into `medical_trips`, `medical_assessments`, and `medical_assessment_tests`
$tripStmt = $db->prepare("
    INSERT INTO `medical_trips` (
        `title`, `slug`, `category`, `short_description`, `description`, `duration`,
        `price`, `market_price`, `discount`, `test_count`, `discount_price`, `price_on_request`,
        `currency`, `location`, `featured_image`, `banner_title`, `banner_subtitle`, `banner_description`,
        `banner_image`, `highlights`, `benefits`, `instructions`, `preparation_guidelines`,
        `included_services`, `excluded_services`, `cancellation_policy`, `is_active`, `is_published`, `display_order`
    ) VALUES (
        :title, :slug, :category, :short_description, :description, :duration,
        :price, :market_price, :discount, :test_count, :discount_price, :price_on_request,
        :currency, :location, :featured_image, :banner_title, :banner_subtitle, :banner_description,
        :banner_image, :highlights, :benefits, :instructions, :preparation_guidelines,
        :included_services, :excluded_services, :cancellation_policy, :is_active, :is_published, :display_order
    )
");

$asmtStmt = $db->prepare("
    INSERT INTO `medical_assessments` (
        `medical_trip_id`, `title`, `subtitle`, `description`, `icon`, `display_order`, `is_active`
    ) VALUES (
        :medical_trip_id, :title, :subtitle, :description, :icon, :display_order, 1
    )
");

$testStmt = $db->prepare("
    INSERT INTO `medical_assessment_tests` (
        `assessment_id`, `test_name`, `description`, `display_order`
    ) VALUES (
        :assessment_id, :test_name, :description, :display_order
    )
");

foreach ($packages as $pkg) {
    $tripStmt->execute([
        ':title' => $pkg['title'],
        ':slug' => $pkg['slug'],
        ':category' => $pkg['category'],
        ':short_description' => $pkg['short_description'],
        ':description' => $pkg['description'],
        ':duration' => $pkg['duration'],
        ':price' => $pkg['price'],
        ':market_price' => $pkg['market_price'],
        ':discount' => $pkg['discount'],
        ':test_count' => $pkg['test_count'],
        ':discount_price' => $pkg['price'] > 0 ? $pkg['price'] : null,
        ':price_on_request' => $pkg['price_on_request'],
        ':currency' => $pkg['currency'],
        ':location' => $pkg['location'],
        ':featured_image' => $pkg['featured_image'],
        ':banner_title' => $pkg['banner_title'],
        ':banner_subtitle' => $pkg['banner_subtitle'],
        ':banner_description' => $pkg['banner_description'],
        ':banner_image' => $pkg['banner_image'],
        ':highlights' => $pkg['highlights'],
        ':benefits' => $pkg['benefits'],
        ':instructions' => $pkg['instructions'],
        ':preparation_guidelines' => $pkg['preparation_guidelines'],
        ':included_services' => $pkg['included_services'],
        ':excluded_services' => $pkg['excluded_services'],
        ':cancellation_policy' => $pkg['cancellation_policy'],
        ':is_active' => $pkg['is_active'],
        ':is_published' => $pkg['is_published'],
        ':display_order' => $pkg['display_order'],
    ]);

    $tripId = (int) $db->lastInsertId();
    echo "Inserted package: {$pkg['title']} (ID: {$tripId})\n";

    if (!empty($pkg['assessments'])) {
        foreach ($pkg['assessments'] as $aIdx => $asmt) {
            $asmtStmt->execute([
                ':medical_trip_id' => $tripId,
                ':title' => $asmt['title'],
                ':subtitle' => $asmt['subtitle'] ?? null,
                ':description' => $asmt['description'] ?? null,
                ':icon' => $asmt['icon'] ?? 'Activity',
                ':display_order' => $asmt['display_order'] ?? ($aIdx + 1),
            ]);
            $asmtId = (int) $db->lastInsertId();

            if (!empty($asmt['tests'])) {
                foreach ($asmt['tests'] as $tIdx => $t) {
                    $testStmt->execute([
                        ':assessment_id' => $asmtId,
                        ':test_name' => $t['test_name'],
                        ':description' => $t['description'] ?? null,
                        ':display_order' => $tIdx + 1,
                    ]);
                }
            }
        }
    }
}

// 8 Add-on Medical Tests
$addons = [
    [
        'addon_name' => 'DEXA',
        'description' => 'Dual-energy X-ray absorptiometry measuring bone mineral density and complete body fat/lean muscle distribution.',
        'price' => 1499.00,
        'image_path' => '/uploads/media/medical_dexa_scan.jpg',
        'display_order' => 1,
    ],
    [
        'addon_name' => 'PAP Smear',
        'description' => 'Liquid-based cervical cytology screening for preventative early detection of cellular changes.',
        'price' => 1499.00,
        'image_path' => '/uploads/media/medical_package_banner.jpg',
        'display_order' => 2,
    ],
    [
        'addon_name' => 'Mammogram',
        'description' => 'Digital low-dose X-ray mammography for early breast tissue screening and wellness.',
        'price' => 1499.00,
        'image_path' => '/uploads/media/medical_package_banner.jpg',
        'display_order' => 3,
    ],
    [
        'addon_name' => 'PFT',
        'description' => 'Pulmonary Function Test measuring lung volume, vital capacity, and airway flow rates.',
        'price' => 1499.00,
        'image_path' => '/uploads/media/medical_vo2_max.jpg',
        'display_order' => 4,
    ],
    [
        'addon_name' => 'MRI',
        'description' => 'Targeted high-resolution magnetic resonance imaging of a single anatomical region of choice.',
        'price' => 1499.00,
        'image_path' => '/uploads/media/medical_full_body_mri.jpg',
        'display_order' => 5,
    ],
    [
        'addon_name' => 'MRI Visceral & Liver Fat',
        'description' => 'Specialized quantitative MRI measuring hepatic steatosis percentage and intra-abdominal visceral adipose volume.',
        'price' => 1499.00,
        'image_path' => '/uploads/media/medical_full_body_mri.jpg',
        'display_order' => 6,
    ],
    [
        'addon_name' => 'DNA Analysis',
        'description' => 'Preventative genetic wellness screening assessing nutritional tendencies, metabolic traits, and hereditary predispositions.',
        'price' => 1499.00,
        'image_path' => '/uploads/media/medical_blood_pro.jpg',
        'display_order' => 7,
    ],
    [
        'addon_name' => 'Strength Testing',
        'description' => 'Biomechanical dynamometry and force-plate assessment profiling muscular strength, bilateral symmetry, and explosive power.',
        'price' => 1499.00,
        'image_path' => '/uploads/media/medical_strength_pro.jpg',
        'display_order' => 8,
    ],
];

$addonStmt = $db->prepare("
    INSERT INTO `medical_addons` (`addon_name`, `description`, `price`, `image_path`, `status`, `display_order`)
    VALUES (:name, :desc, :price, :image, 'active', :order)
");

foreach ($addons as $ad) {
    $addonStmt->execute([
        ':name' => $ad['addon_name'],
        ':desc' => $ad['description'],
        ':price' => $ad['price'],
        ':image' => $ad['image_path'],
        ':order' => $ad['display_order'],
    ]);
    echo "Inserted Add-on: {$ad['addon_name']} (₹{$ad['price']})\n";
}

echo "\nSeeding complete! 7 packages and 8 add-ons successfully created in MySQL.\n";
