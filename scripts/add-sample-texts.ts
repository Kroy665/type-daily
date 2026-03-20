import { PrismaClient, Difficulty } from '@prisma/client'

const prisma = new PrismaClient()

const sampleTexts = [
    // EASY - 60 seconds (1 minute)
    {
        difficulty: 'EASY' as Difficulty,
        time: 60,
        text: 'The quick brown fox jumps over the lazy dog. This is a simple sentence to practice typing. Keep your fingers on the home row keys.'
    },
    {
        difficulty: 'EASY' as Difficulty,
        time: 60,
        text: 'Practice makes perfect. Type slowly at first, then gradually increase your speed. Focus on accuracy before speed.'
    },
    {
        difficulty: 'EASY' as Difficulty,
        time: 60,
        text: 'Welcome to typing practice. Use all ten fingers when typing. Do not look at the keyboard while typing. Good luck!'
    },

    // EASY - 300 seconds (5 minutes)
    {
        difficulty: 'EASY' as Difficulty,
        time: 300,
        text: 'The sun rises in the east and sets in the west. Birds fly high in the sky. Trees provide shade and fresh air. Water is essential for life. Practice typing every day to improve your skills. Remember to take breaks and stretch your fingers. Good posture is important for comfortable typing. Keep your wrists straight and your back upright.'
    },

    // EASY - 900 seconds (15 minutes)
    {
        difficulty: 'EASY' as Difficulty,
        time: 900,
        text: 'Learning to type is a valuable skill in the modern world. Computers are everywhere, and knowing how to type quickly and accurately will save you time and make you more productive. Start by learning the home row keys. Your left hand fingers should rest on A, S, D, F and your right hand on J, K, L, semicolon. The thumbs rest on the space bar. Once you master the home row, you can move on to the top and bottom rows. Practice regularly, even just 10 minutes a day, and you will see improvement. Do not get discouraged if progress seems slow at first. Typing is a skill that builds over time with consistent practice.'
    },

    // MEDIUM - 60 seconds (1 minute)
    {
        difficulty: 'MEDIUM' as Difficulty,
        time: 60,
        text: 'Technology has revolutionized the way we communicate and work. Smartphones, tablets, and computers have become essential tools in our daily lives. Social media platforms connect people across the globe instantly.'
    },
    {
        difficulty: 'MEDIUM' as Difficulty,
        time: 60,
        text: 'The advancement of artificial intelligence is transforming industries worldwide. Machine learning algorithms can now perform complex tasks that once required human intelligence. This technological evolution presents both opportunities and challenges.'
    },
    {
        difficulty: 'MEDIUM' as Difficulty,
        time: 60,
        text: 'Climate change remains one of the most pressing issues of our time. Rising temperatures, melting ice caps, and extreme weather events are clear indicators. Sustainable practices and renewable energy are crucial for our future.'
    },
    {
        difficulty: 'MEDIUM' as Difficulty,
        time: 60,
        text: 'Programming languages like Python, JavaScript, and Java are fundamental to modern software development. Understanding these languages opens doors to countless career opportunities in the tech industry.'
    },
    {
        difficulty: 'MEDIUM' as Difficulty,
        time: 60,
        text: 'The concept of remote work has gained tremendous popularity in recent years. Many companies now offer flexible work arrangements, allowing employees to work from anywhere with an internet connection.'
    },

    // MEDIUM - 300 seconds (5 minutes)
    {
        difficulty: 'MEDIUM' as Difficulty,
        time: 300,
        text: 'The internet has fundamentally changed how we access information and communicate with each other. What once required trips to libraries or lengthy phone calls can now be accomplished with a few clicks or taps. This unprecedented access to information has democratized knowledge, making educational resources available to anyone with an internet connection. However, it also presents challenges such as information overload and the spread of misinformation. Critical thinking skills are more important than ever in evaluating the credibility of online sources. Digital literacy has become as essential as traditional literacy in navigating the modern world.'
    },

    // MEDIUM - 900 seconds (15 minutes)
    {
        difficulty: 'MEDIUM' as Difficulty,
        time: 900,
        text: 'The history of computing is a fascinating journey from mechanical calculators to quantum computers. In the early days, computers were massive machines that filled entire rooms and required teams of operators. The invention of the transistor in 1947 revolutionized electronics and paved the way for smaller, more powerful computers. The development of integrated circuits in the 1960s further miniaturized computing technology. Personal computers became available in the 1970s and 1980s, bringing computing power into homes and small businesses. The internet, which began as a military project, evolved into a global network connecting billions of people. Mobile technology has made computing truly ubiquitous, with smartphones more powerful than the computers that guided astronauts to the moon. Today, we stand on the brink of new computing paradigms including quantum computing, artificial intelligence, and brain-computer interfaces. The pace of technological change continues to accelerate, promising both exciting opportunities and significant challenges for society.'
    },

    // HARD - 60 seconds (1 minute)
    {
        difficulty: 'HARD' as Difficulty,
        time: 60,
        text: 'Quantum entanglement, a phenomenon Einstein called "spooky action at a distance," occurs when particles become interconnected such that the quantum state of one instantaneously influences another, regardless of spatial separation. This counterintuitive principle underlies quantum computing\'s revolutionary potential.'
    },
    {
        difficulty: 'HARD' as Difficulty,
        time: 60,
        text: 'The philosophical implications of consciousness extend beyond neuroscience into metaphysics, epistemology, and ethics. Distinguishing between phenomenal consciousness (subjective experience) and access consciousness (information processing) remains a fundamental challenge in cognitive science and artificial intelligence research.'
    },
    {
        difficulty: 'HARD' as Difficulty,
        time: 60,
        text: 'Cryptographic hash functions utilize complex mathematical algorithms to transform arbitrary input data into fixed-size outputs, ensuring data integrity through collision resistance, preimage resistance, and deterministic reproducibility—fundamental properties securing blockchain technologies and digital signatures.'
    },

    // HARD - 300 seconds (5 minutes)
    {
        difficulty: 'HARD' as Difficulty,
        time: 300,
        text: 'The bifurcation theory in dynamical systems examines qualitative changes in system behavior as parameters vary. Catastrophe theory, pioneered by René Thom, extends this framework to analyze discontinuous phenomena in diverse fields from optics to economics. Strange attractors in chaotic systems exhibit fractal geometries with non-integer Hausdorff dimensions. The Lorenz attractor, discovered through numerical weather prediction models, demonstrates sensitive dependence on initial conditions—the hallmark of deterministic chaos. Julia sets and the Mandelbrot set represent complex dynamics in iterative maps, revealing self-similar structures across scales.'
    },

    // HARD - 900 seconds (15 minutes)
    {
        difficulty: 'HARD' as Difficulty,
        time: 900,
        text: 'The Standard Model of particle physics represents humanity\'s most comprehensive theoretical framework for understanding fundamental particles and their interactions. Quantum chromodynamics describes strong nuclear forces through color charge and gluon exchange, while electroweak theory unifies electromagnetic and weak nuclear forces via spontaneous symmetry breaking. The Higgs mechanism, confirmed by Large Hadron Collider experiments, explains mass generation through scalar field interactions. Beyond the Standard Model, supersymmetry postulates partner particles for each known particle, potentially resolving hierarchy problems and providing dark matter candidates. String theory attempts unified field theory through one-dimensional vibrating strings in higher-dimensional spacetime. Loop quantum gravity offers alternative quantum gravity formulation without requiring extra dimensions. The cosmological constant problem, matter-antimatter asymmetry, and neutrino mass generation remain unresolved puzzles. Experimental particle physics employs sophisticated detectors, statistical analysis, and international collaboration to probe energy scales approaching the Planck scale, seeking evidence for new physics beyond established theories.'
    },

    // EASY - 60 seconds (1 minute)
    {
        difficulty: 'EASY' as Difficulty,
        time: 60,
        text: 'A journey of a thousand miles begins with a single step. Take your time and focus on each word. Typing is easier when you relax and stay calm.'
    },
    {
        difficulty: 'EASY' as Difficulty,
        time: 60,
        text: 'Reading books opens new worlds and expands your imagination. Libraries are treasure chests filled with knowledge. Visit your local library today.'
    },
    {
        difficulty: 'EASY' as Difficulty,
        time: 60,
        text: 'The beach is a wonderful place to relax. Listen to the waves and feel the sand between your toes. Summer vacation is the best time of year.'
    },
    {
        difficulty: 'EASY' as Difficulty,
        time: 60,
        text: 'Healthy eating habits lead to a better life. Fruits and vegetables provide essential vitamins. Drink plenty of water every day to stay hydrated.'
    },
    {
        difficulty: 'EASY' as Difficulty,
        time: 60,
        text: 'Music brings joy to people of all ages. Learning to play an instrument takes patience and practice. Start with simple songs and work your way up.'
    },

    // EASY - 300 seconds (5 minutes)
    {
        difficulty: 'EASY' as Difficulty,
        time: 300,
        text: 'Exercise is important for maintaining good health. Regular physical activity strengthens your heart and muscles. It also helps reduce stress and improve your mood. You do not need expensive equipment to start exercising. Simple activities like walking, jogging, or doing bodyweight exercises at home can make a big difference. Aim for at least thirty minutes of moderate exercise most days of the week. Remember to warm up before exercising and cool down afterwards. Stay hydrated by drinking water before, during, and after your workout. Listen to your body and rest when needed. Consistency is more important than intensity when starting a new exercise routine.'
    },
    {
        difficulty: 'EASY' as Difficulty,
        time: 300,
        text: 'Cooking at home is both fun and rewarding. You can control the ingredients and make healthier meals for your family. Start with simple recipes and gradually try more complex dishes. Fresh ingredients always taste better than processed foods. Learn basic cooking techniques like chopping, sautéing, and baking. Keep your kitchen organized and clean for a better cooking experience. Involve your children in meal preparation to teach them valuable life skills. Experiment with different herbs and spices to add flavor without extra calories. Meal planning helps save time and money throughout the week. Enjoy the process of creating delicious meals from scratch.'
    },

    // EASY - 900 seconds (15 minutes)
    {
        difficulty: 'EASY' as Difficulty,
        time: 900,
        text: 'Gardening is a wonderful hobby that connects you with nature and provides fresh produce. Whether you have a large backyard or just a small balcony, you can grow plants successfully. Start with easy plants like tomatoes, herbs, or lettuce. These plants are forgiving for beginners and produce good results. Understanding basic gardening principles will help you succeed. Plants need sunlight, water, and nutrients to grow properly. Most vegetables need at least six hours of direct sunlight daily. Check the soil moisture regularly and water when the top inch feels dry. Too much water can harm plants just as much as too little. Adding compost to your soil improves its quality and provides natural nutrients. Learn about your local climate and growing season to choose appropriate plants. Some plants prefer cool weather while others thrive in heat. Companion planting can help deter pests naturally without harmful chemicals. For example, planting marigolds near tomatoes can repel certain insects. Keep a gardening journal to track what works well in your garden. Note planting dates, weather conditions, and harvest times. This information becomes valuable as you continue gardening year after year. Be patient with yourself as you learn. Every gardener makes mistakes, but each mistake teaches valuable lessons. The joy of harvesting your own fresh vegetables makes all the effort worthwhile.'
    },

    // MEDIUM - 60 seconds (1 minute)
    {
        difficulty: 'MEDIUM' as Difficulty,
        time: 60,
        text: 'Blockchain technology represents a paradigm shift in how we store and transfer data. Decentralized ledgers eliminate single points of failure, enhancing security and transparency. Cryptocurrencies demonstrate just one application of this versatile technology.'
    },
    {
        difficulty: 'MEDIUM' as Difficulty,
        time: 60,
        text: 'The gig economy has transformed traditional employment structures. Freelancers and independent contractors now comprise a significant portion of the workforce. Platforms connecting workers with short-term opportunities continue proliferating globally.'
    },
    {
        difficulty: 'MEDIUM' as Difficulty,
        time: 60,
        text: 'Renewable energy sources like solar and wind power are becoming increasingly cost-effective. Investment in sustainable infrastructure addresses environmental concerns while creating economic opportunities. The transition away from fossil fuels accelerates annually.'
    },
    {
        difficulty: 'MEDIUM' as Difficulty,
        time: 60,
        text: 'Virtual reality technology immerses users in computer-generated environments. Applications range from entertainment and gaming to education and professional training. As hardware improves and costs decrease, adoption rates continue climbing steadily.'
    },
    {
        difficulty: 'MEDIUM' as Difficulty,
        time: 60,
        text: 'Cybersecurity threats evolve constantly as hackers develop sophisticated techniques. Organizations invest heavily in protective measures including firewalls, encryption, and employee training. Data breaches can result in significant financial and reputational damage.'
    },
    {
        difficulty: 'MEDIUM' as Difficulty,
        time: 60,
        text: 'E-commerce has revolutionized retail by enabling purchases from anywhere at any time. Traditional brick-and-mortar stores adapt by developing omnichannel strategies. Consumer behavior increasingly favors convenience and personalized shopping experiences.'
    },

    // MEDIUM - 300 seconds (5 minutes)
    {
        difficulty: 'MEDIUM' as Difficulty,
        time: 300,
        text: 'The rise of electric vehicles marks a significant milestone in automotive history. Traditional combustion engines dominated transportation for over a century, but environmental concerns and technological advances are driving a fundamental shift. Battery technology improvements have extended driving ranges while reducing charging times. Major automakers are investing billions in electric vehicle development and production facilities. Governments worldwide offer incentives to encourage adoption through tax credits and rebates. Charging infrastructure continues expanding, making electric vehicles more practical for daily use. Concerns about battery disposal and electricity grid capacity remain subjects of ongoing research. Autonomous driving features increasingly integrate with electric platforms, promising safer and more efficient transportation. The automotive industry faces unprecedented disruption as software becomes as important as mechanical engineering. Legacy manufacturers compete with technology companies entering the market with innovative approaches. Consumer acceptance grows as electric vehicles achieve price parity with traditional cars and performance metrics improve dramatically.'
    },
    {
        difficulty: 'MEDIUM' as Difficulty,
        time: 300,
        text: 'Mental health awareness has gained prominence in recent years, reducing stigma and encouraging people to seek help. The pressures of modern life, including work stress, social media, and economic uncertainty, contribute to rising anxiety and depression rates. Understanding mental health as seriously as physical health represents crucial progress. Therapy and counseling provide effective treatment for many conditions. Cognitive behavioral therapy helps people identify and change negative thought patterns. Mindfulness and meditation practices offer additional tools for managing stress and improving emotional well-being. Regular exercise and adequate sleep significantly impact mental health. Social connections and supportive relationships buffer against psychological distress. Workplace policies increasingly recognize mental health needs through employee assistance programs and flexible schedules. Schools implement social-emotional learning curricula to build resilience in young people. Teletherapy options expand access to mental health services, particularly in underserved areas. Continued research into brain chemistry and psychological processes promises better treatments and understanding of mental health conditions.'
    },

    // MEDIUM - 900 seconds (15 minutes)
    {
        difficulty: 'MEDIUM' as Difficulty,
        time: 900,
        text: 'Space exploration captivates human imagination and drives scientific advancement. Since the first artificial satellite launched in 1957, humanity has achieved remarkable milestones including lunar landings, Mars rovers, and the International Space Station. Private companies now complement government space agencies, reducing costs through reusable rockets and innovative engineering. SpaceX, Blue Origin, and other firms pursue ambitious goals including Mars colonization and space tourism. Scientific missions probe the solar system, studying planetary atmospheres, searching for water, and investigating the potential for extraterrestrial life. The James Webb Space Telescope provides unprecedented views of distant galaxies, expanding our understanding of cosmic evolution. Satellite technology enables GPS navigation, weather forecasting, and global communications that modern society depends upon daily. Climate monitoring satellites track environmental changes with precision impossible from ground-based observations. Asteroid mining may eventually provide valuable resources while reducing terrestrial extraction impacts. International cooperation in space continues despite geopolitical tensions, demonstrating shared human interests beyond national boundaries. China, India, and other nations develop robust space programs, increasing global participation. The Artemis program aims to return humans to the Moon, establishing sustainable presence for scientific research and eventual Mars missions. Technical challenges include radiation protection, life support systems, and psychological impacts of long-duration spaceflight. Resource utilization technologies seek to manufacture fuel, water, and building materials from local materials rather than launching everything from Earth. The overview effect, experienced by astronauts viewing Earth from space, often produces profound perspective shifts regarding environmental stewardship and human unity. Educational outreach inspires young people to pursue careers in science, technology, engineering, and mathematics. As capabilities expand and costs decrease, space may transition from exclusive domain of superpowers to accessible frontier for broader participation. The long-term survival of humanity may depend on becoming multiplanetary species, protecting against existential risks on Earth. Ethical considerations about planetary protection, resource rights, and space governance require international dialogue and agreement. The next decades promise exciting developments as humanity extends its reach beyond our home planet into the cosmos.'
    },

    // HARD - 60 seconds (1 minute)
    {
        difficulty: 'HARD' as Difficulty,
        time: 60,
        text: 'Heisenberg\'s uncertainty principle mathematically constrains simultaneous precision in measuring complementary variables like position and momentum: ΔxΔp ≥ ℏ/2. This fundamental limitation stems from wave-particle duality rather than measurement imperfections, profoundly challenging classical determinism.'
    },
    {
        difficulty: 'HARD' as Difficulty,
        time: 60,
        text: 'CRISPR-Cas9 gene editing employs guide RNA sequences to direct Cas9 endonuclease to specific genomic loci, enabling precise double-strand breaks. Homology-directed repair or non-homologous end joining subsequently modifies targeted sequences, revolutionizing genetic engineering across prokaryotic and eukaryotic organisms.'
    },
    {
        difficulty: 'HARD' as Difficulty,
        time: 60,
        text: 'Gödel\'s incompleteness theorems demonstrate that any consistent formal system encompassing arithmetic contains unprovable true statements. This metamathematical result establishes inherent limitations in axiomatic approaches, fundamentally impacting mathematical logic, computer science, and epistemology.'
    },
    {
        difficulty: 'HARD' as Difficulty,
        time: 60,
        text: 'Relativistic quantum field theory reconciles special relativity with quantum mechanics through operator-valued distributions on Minkowski spacetime. Feynman diagrams provide perturbative calculation methods for scattering amplitudes, incorporating virtual particles and renormalization procedures to eliminate divergences.'
    },

    // HARD - 300 seconds (5 minutes)
    {
        difficulty: 'HARD' as Difficulty,
        time: 300,
        text: 'Topological quantum computing exploits non-abelian anyons—quasiparticles existing in two-dimensional systems whose exchange operations generate unitary transformations in degenerate ground-state subspaces. Braiding operations encode quantum information topologically, providing intrinsic error protection against local perturbations. Majorana fermions, emerging in certain superconductor-semiconductor heterostructures, represent promising anyon candidates. Fractional quantum Hall systems at specific filling factors exhibit fractional charge excitations with anyonic statistics. Topological codes like surface codes and color codes implement error correction through stabilizer measurements on qubit lattices. Decoherence suppression in topological systems depends on energy gaps separating ground states from excited states, requiring ultralow temperatures. Experimental implementations face significant challenges including material fabrication, precise control mechanisms, and scalable architectures. Microsoft, Google, and academic institutions pursue diverse approaches balancing theoretical elegance with practical feasibility.'
    },
    {
        difficulty: 'HARD' as Difficulty,
        time: 300,
        text: 'Bayesian inference provides probabilistic framework for updating beliefs given evidence through Bayes\' theorem: P(H|E) = P(E|H)P(H)/P(E). Prior probability distributions encode initial beliefs before observing data. Likelihood functions specify evidence probability assuming hypothesis truth. Posterior distributions combine priors and likelihoods, representing updated beliefs. Conjugate priors simplify calculations by ensuring posterior distributions maintain prior functional forms. Markov Chain Monte Carlo methods approximate intractable posteriors through iterative sampling procedures. Gibbs sampling and Metropolis-Hastings algorithms generate samples from target distributions without direct calculation. Variational inference approximates posteriors using optimization rather than sampling, trading exactness for computational efficiency. Hierarchical Bayesian models capture multilevel structure through parameter distributions depending on hyperparameters. Applications span machine learning, statistics, cognitive science, and decision theory, providing principled uncertainty quantification absent in frequentist approaches.'
    },

    // HARD - 900 seconds (15 minutes)
    {
        difficulty: 'HARD' as Difficulty,
        time: 900,
        text: 'Category theory abstracts mathematical structures through objects and morphisms, revealing deep connections across diverse domains. Functors map between categories preserving compositional structure, while natural transformations relate functors maintaining coherence conditions. The Yoneda lemma establishes profound relationship between objects and their representable functors, suggesting objects are determined by morphisms into them. Adjoint functors formalize optimal solutions to universal problems, appearing throughout mathematics in Galois connections, free-forgetful relationships, and tensor-hom adjunctions. Monoidal categories equip objects with tensor products satisfying associativity and unit axioms up to coherent isomorphisms. Symmetric monoidal categories additionally satisfy braiding axioms, modeling commutativity. Closed monoidal categories possess internal hom-objects satisfying exponential laws, generalizing function spaces. Enriched category theory permits hom-sets drawn from categories beyond Set, enabling metric spaces, preorders, and probabilistic structures as enriching categories. Categorical logic interprets type theories and programming languages through categories, functors, and natural transformations. Propositions correspond to objects, proofs to morphisms, yielding computational models via Curry-Howard-Lambek correspondence. Topoi generalize set theory, providing categorical foundations for mathematics with internal logic supporting intuitionistic reasoning. Elementary topoi satisfy axioms enabling subobject classifiers, exponentials, and finite limits, admitting varied interpretations including sheaves, presheaves, and realizability topoi. Higher category theory extends classical categories incorporating higher-dimensional morphisms: 2-morphisms between morphisms, 3-morphisms between 2-morphisms, continuing indefinitely or stabilizing at infinity-categories. Homotopy type theory identifies types with spaces, terms with points, and equality proofs with paths, unifying logic and topology through dependent type theory. This synthesis enables computer-verified mathematical proofs while suggesting connections between logic, geometry, and physics. Derived categories in homological algebra employ chain complexes and quasi-isomorphisms, resolving modules to compute functors like Tor and Ext. Triangulated categories axiomatize essential properties of derived categories, though lacking full categorical structure of stable infinity-categories. Model categories provide abstract homotopy theory framework through weak equivalences, fibrations, and cofibrations satisfying Quillen axioms. Abstract homotopy theory applies to diverse contexts beyond topological spaces, including chain complexes, simplicial sets, and spectra. Operads encode algebraic structures through composition operations satisfying equivariance and associativity, generalizing classical notions like groups, algebras, and categories themselves. Colored operads model structures with multiple object types, appearing in quantum field theory, knot invariants, and deformation theory. Categorical approaches pervade modern mathematics, providing unifying language revealing structural similarities across apparently disparate areas while suggesting novel connections and research directions.'
    },

    // EASY - 60 seconds - Basic punctuation practice
    {
        difficulty: 'EASY' as Difficulty,
        time: 60,
        text: 'Hello! How are you today? I\'m doing well, thank you. It\'s a beautiful day, isn\'t it? Yes, it is! Let\'s go for a walk. That sounds great!'
    },
    {
        difficulty: 'EASY' as Difficulty,
        time: 60,
        text: 'Don\'t worry about mistakes. You\'re doing great! Practice makes perfect. "Success is the sum of small efforts," said someone wise. Keep going!'
    },
    {
        difficulty: 'EASY' as Difficulty,
        time: 60,
        text: 'Type these numbers: 1, 2, 3, 4, 5. Now try: 10, 20, 30, 40, 50. Great! Numbers & letters together: A1, B2, C3, D4, E5.'
    },

    // EASY - 300 seconds - Email and basic formatting
    {
        difficulty: 'EASY' as Difficulty,
        time: 300,
        text: 'Email addresses use the @ symbol. For example: john.doe@email.com or jane_smith@company.org. Websites start with www. like www.example.com or https://website.net. Phone numbers use dashes: 555-1234 or (555) 123-4567. Dates can be written as 01/15/2024 or 2024-01-15. Percentages use %: 50%, 75%, 100%. Money amounts use $: $10.99, $25.50, $100.00. Remember these common symbols: & (ampersand), # (hashtag), * (asterisk), + (plus), = (equals), - (dash), _ (underscore).'
    },

    // MEDIUM - 60 seconds - Code snippets and symbols
    {
        difficulty: 'MEDIUM' as Difficulty,
        time: 60,
        text: 'const name = "John"; let age = 25; var score = 100; if (age >= 18) { console.log("Adult"); } else { console.log("Minor"); }'
    },
    {
        difficulty: 'MEDIUM' as Difficulty,
        time: 60,
        text: 'function add(a, b) { return a + b; } const multiply = (x, y) => x * y; let result = add(5, 3); console.log(result);'
    },
    {
        difficulty: 'MEDIUM' as Difficulty,
        time: 60,
        text: 'array = [1, 2, 3, 4, 5]; obj = {name: "Alice", age: 30, city: "NYC"}; str = `Hello ${name}, you are ${age} years old!`;'
    },
    {
        difficulty: 'MEDIUM' as Difficulty,
        time: 60,
        text: 'for (let i = 0; i < 10; i++) { sum += arr[i]; } while (count > 0) { count--; } arr.map(x => x * 2).filter(x => x > 5);'
    },
    {
        difficulty: 'MEDIUM' as Difficulty,
        time: 60,
        text: 'import React, { useState, useEffect } from "react"; const [count, setCount] = useState(0); useEffect(() => { document.title = `Count: ${count}`; }, [count]);'
    },

    // MEDIUM - 300 seconds - HTML/CSS/JavaScript mix
    {
        difficulty: 'MEDIUM' as Difficulty,
        time: 300,
        text: 'HTML uses tags like <div>, <p>, <span>, <h1>, <a href="#">, <img src="photo.jpg" />, <ul><li>item</li></ul>. CSS properties: color: #FF5733; background-color: rgba(0, 0, 0, 0.5); margin: 10px 20px; padding: 5px; border: 1px solid #000; display: flex; justify-content: center; align-items: center; .class { font-size: 16px; } #id { width: 100%; } JavaScript operators: ==, ===, !=, !==, <, >, <=, >=, &&, ||, !, typeof, instanceof. Ternary: condition ? true : false; Destructuring: const {x, y} = obj; Spread: [...arr1, ...arr2]; Rest: function(...args) { }; Template literals: `Value is ${val}`;'
    },
    {
        difficulty: 'MEDIUM' as Difficulty,
        time: 300,
        text: 'SQL queries include symbols: SELECT * FROM users WHERE age > 18 AND status = "active"; INSERT INTO products (name, price) VALUES ("Phone", 599.99); UPDATE orders SET status = "shipped" WHERE id = 123; DELETE FROM logs WHERE created_at < "2024-01-01"; JOIN operations: SELECT u.name, o.total FROM users u INNER JOIN orders o ON u.id = o.user_id; Aggregates: COUNT(*), SUM(price), AVG(rating), MAX(score), MIN(value); GROUP BY category HAVING COUNT(*) > 5; CREATE TABLE items (id INT PRIMARY KEY AUTO_INCREMENT, name VARCHAR(255) NOT NULL, price DECIMAL(10,2));'
    },

    // MEDIUM - 900 seconds - Mixed programming languages
    {
        difficulty: 'MEDIUM' as Difficulty,
        time: 900,
        text: 'Python code examples: def calculate_average(numbers): total = sum(numbers); return total / len(numbers) if len(numbers) > 0 else 0; List comprehension: squares = [x**2 for x in range(10) if x % 2 == 0]; Dictionary: person = {"name": "Alice", "age": 30, "email": "alice@email.com"}; Lambda functions: multiply = lambda x, y: x * y; File operations: with open("data.txt", "r") as file: content = file.read(); Exception handling: try: result = 10 / 0; except ZeroDivisionError as e: print(f"Error: {e}"); Classes: class Vehicle: def __init__(self, brand, model): self.brand = brand; self.model = model; Decorators: @property, @staticmethod, @classmethod. JSON parsing in JavaScript: const data = JSON.parse(jsonString); const json = JSON.stringify(obj, null, 2); Fetch API: fetch("https://api.example.com/data").then(res => res.json()).then(data => console.log(data)).catch(err => console.error(err)); Async/await: async function getData() { const response = await fetch(url); const data = await response.json(); return data; } Regular expressions: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$/; const regex = new RegExp("\\d{3}-\\d{4}"); Git commands: git init; git add .; git commit -m "Initial commit"; git push origin main; git pull; git branch feature-xyz; git checkout -b new-feature; git merge develop; npm commands: npm install package-name --save; npm run dev; npm test; npm build; package.json: {"name": "project", "version": "1.0.0", "scripts": {"start": "node index.js"}, "dependencies": {"express": "^4.18.0"}};'
    },

    // HARD - 60 seconds - Advanced symbols and operators
    {
        difficulty: 'HARD' as Difficulty,
        time: 60,
        text: 'const obj = {...prev, [key]: val}; arr?.map?.(x => x?.prop ?? "default"); type User = {id: number; name?: string | null;}; interface Props<T> extends BaseProps { data: T[]; }'
    },
    {
        difficulty: 'HARD' as Difficulty,
        time: 60,
        text: 'Regex: /^(?=.*[A-Z])(?=.*[a-z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,}$/; match = str.match(/\\b\\w+\\b/g); replace = text.replace(/[^a-zA-Z0-9]/g, "_");'
    },
    {
        difficulty: 'HARD' as Difficulty,
        time: 60,
        text: 'Math: x = (-b ± √(b²-4ac)) / 2a; π ≈ 3.14159; e ≈ 2.71828; ∑(i=1 to n) i = n(n+1)/2; ∫f(x)dx; lim(x→∞) 1/x = 0; f\'(x) = dy/dx;'
    },
    {
        difficulty: 'HARD' as Difficulty,
        time: 60,
        text: 'Bitwise: a & b; a | b; a ^ b; ~a; a << 2; b >> 1; a >>> 0; (x & 1) === 0; mask = 0xFF; flags = 0b1010 | 0b0101; hex = 0xDEADBEEF;'
    },
    {
        difficulty: 'HARD' as Difficulty,
        time: 60,
        text: 'TypeScript: type Result<T, E> = {ok: true; value: T} | {ok: false; error: E}; const parse = <T>(json: string): Result<T, Error> => { try { return {ok: true, value: JSON.parse(json)}; } catch(e) { return {ok: false, error: e as Error}; }};'
    },

    // HARD - 300 seconds - Complex code with special characters
    {
        difficulty: 'HARD' as Difficulty,
        time: 300,
        text: 'React TypeScript component: interface ButtonProps { variant?: "primary" | "secondary"; size?: "sm" | "md" | "lg"; onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void; children: React.ReactNode; disabled?: boolean; className?: string; } const Button: React.FC<ButtonProps> = ({variant = "primary", size = "md", onClick, children, disabled = false, className = ""}) => { const baseStyles = "rounded-lg font-semibold transition-all"; const variants = {primary: "bg-blue-500 hover:bg-blue-600 text-white", secondary: "bg-gray-200 hover:bg-gray-300 text-gray-800"}; const sizes = {sm: "px-3 py-1 text-sm", md: "px-4 py-2 text-base", lg: "px-6 py-3 text-lg"}; return (<button className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${disabled ? "opacity-50 cursor-not-allowed" : ""} ${className}`} onClick={onClick} disabled={disabled}>{children}</button>); }; export default Button;'
    },
    {
        difficulty: 'HARD' as Difficulty,
        time: 300,
        text: 'Advanced JavaScript patterns: const debounce = (fn, delay) => { let timeoutId; return (...args) => { clearTimeout(timeoutId); timeoutId = setTimeout(() => fn(...args), delay); }; }; const throttle = (fn, limit) => { let inThrottle; return (...args) => { if (!inThrottle) { fn(...args); inThrottle = true; setTimeout(() => inThrottle = false, limit); } }; }; const memoize = (fn) => { const cache = new Map(); return (...args) => { const key = JSON.stringify(args); if (cache.has(key)) return cache.get(key); const result = fn(...args); cache.set(key, result); return result; }; }; Curry function: const curry = (fn) => { return function curried(...args) { if (args.length >= fn.length) { return fn.apply(this, args); } return (...nextArgs) => curried.apply(this, [...args, ...nextArgs]); }; }; const add = (a, b, c) => a + b + c; const curriedAdd = curry(add); curriedAdd(1)(2)(3); // 6'
    },
    {
        difficulty: 'HARD' as Difficulty,
        time: 300,
        text: 'Linux shell commands and symbols: grep -rn "pattern" /path/to/dir | awk \'{print $1}\' | sort | uniq -c; find . -name "*.js" -type f -exec grep -l "console.log" {} \\; | xargs sed -i "s/console.log/logger.debug/g"; ps aux | grep node | awk \'{print $2}\' | xargs kill -9; tar -czvf backup-$(date +%Y%m%d).tar.gz /path/to/dir; curl -X POST https://api.example.com/data -H "Content-Type: application/json" -H "Authorization: Bearer ${TOKEN}" -d \'{"key": "value"}\'; ssh user@host "cd /app && git pull && npm install && pm2 restart all"; crontab entry: 0 */6 * * * /usr/bin/backup.sh >> /var/log/backup.log 2>&1; chmod 755 script.sh; chown user:group file.txt; ln -s /path/to/file symlink; tail -f /var/log/app.log | grep ERROR;'
    },

    // HARD - 900 seconds - Maximum symbol density
    {
        difficulty: 'HARD' as Difficulty,
        time: 900,
        text: 'GraphQL schema definition: type Query { user(id: ID!): User; users(filter: UserFilter, limit: Int = 10, offset: Int = 0): [User!]!; posts(authorId: ID, published: Boolean): [Post!]; } type Mutation { createUser(input: CreateUserInput!): User!; updateUser(id: ID!, input: UpdateUserInput!): User; deleteUser(id: ID!): Boolean!; } type User { id: ID!; email: String!; name: String; age: Int; posts: [Post!]!; createdAt: DateTime!; } type Post { id: ID!; title: String!; content: String; author: User!; tags: [String!]; published: Boolean!; } input CreateUserInput { email: String!; name: String!; age: Int; } input UserFilter { email: String; ageMin: Int; ageMax: Int; } Resolver implementation: const resolvers = { Query: { user: async (_, {id}, {db}) => await db.users.findById(id), users: async (_, {filter, limit, offset}, {db}) => { const query = {}; if (filter?.email) query.email = {$regex: filter.email, $options: "i"}; if (filter?.ageMin) query.age = {...query.age, $gte: filter.ageMin}; if (filter?.ageMax) query.age = {...query.age, $lte: filter.ageMax}; return await db.users.find(query).limit(limit).skip(offset); }}, Mutation: { createUser: async (_, {input}, {db}) => await db.users.create(input), updateUser: async (_, {id, input}, {db}) => await db.users.findByIdAndUpdate(id, input, {new: true}) }}; Docker commands: docker build -t myapp:latest .; docker run -d -p 8080:8080 --name myapp-container -e NODE_ENV=production -v /host/path:/container/path myapp:latest; docker-compose.yml: version: "3.8"; services: { app: { build: ., ports: ["3000:3000"], environment: { DATABASE_URL: "${DB_URL}", NODE_ENV: "production" }, depends_on: ["db"] }, db: { image: "postgres:14", environment: { POSTGRES_PASSWORD: "${DB_PASS}" }, volumes: ["pgdata:/var/lib/postgresql/data"] } }; volumes: { pgdata: {} }; Kubernetes manifest: apiVersion: apps/v1; kind: Deployment; metadata: { name: app-deployment; labels: {app: web} }; spec: { replicas: 3; selector: {matchLabels: {app: web}}; template: { metadata: {labels: {app: web}}; spec: { containers: [{ name: app, image: "myapp:1.0", ports: [{containerPort: 8080}], env: [{name: "API_KEY", valueFrom: {secretKeyRef: {name: api-secret, key: key}}}] }] } } }; Terraform configuration: resource "aws_instance" "web" { ami = var.ami_id; instance_type = "t2.micro"; tags = { Name = "WebServer-${var.environment}"; Environment = var.environment }; vpc_security_group_ids = [aws_security_group.web.id]; user_data = <<-EOF #!/bin/bash apt-get update && apt-get install -y nginx systemctl start nginx EOF }; Regular expressions for validation: email: /^[a-zA-Z0-9.!#$%&\'*+\\/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/; URL: /^https?:\\/\\/(www\\.)?[-a-zA-Z0-9@:%._\\+~#=]{1,256}\\.[a-zA-Z0-9()]{1,6}\\b([-a-zA-Z0-9()@:%_\\+.~#?&\\/\\/=]*)$/; Phone: /^[\\+]?[(]?[0-9]{3}[)]?[-\\s\\.]?[0-9]{3}[-\\s\\.]?[0-9]{4,6}$/;'
    },
    {
        difficulty: 'HARD' as Difficulty,
        time: 900,
        text: 'Advanced C++ template metaprogramming: template<typename T, typename... Args> class Tuple; template<typename T> class Tuple<T> { private: T value; public: Tuple(const T& v) : value(v) {} T get() const { return value; } }; template<typename T, typename... Rest> class Tuple<T, Rest...> : private Tuple<Rest...> { private: T value; public: Tuple(const T& v, const Rest&... rest) : Tuple<Rest...>(rest...), value(v) {} T get() const { return value; } }; Compile-time factorial: template<int N> struct Factorial { static constexpr int value = N * Factorial<N-1>::value; }; template<> struct Factorial<0> { static constexpr int value = 1; }; SFINAE example: template<typename T> typename std::enable_if<std::is_integral<T>::value, T>::type abs(T x) { return x < 0 ? -x : x; } Variadic template sum: template<typename T> T sum(T t) { return t; } template<typename T, typename... Args> T sum(T first, Args... args) { return first + sum(args...); } Lambda expressions: auto lambda = [&captured, copied = value](auto&& param) mutable -> decltype(auto) { return process(std::forward<decltype(param)>(param), captured, copied); }; Perfect forwarding: template<typename T, typename... Args> std::unique_ptr<T> make_unique(Args&&... args) { return std::unique_ptr<T>(new T(std::forward<Args>(args)...)); } Move semantics: class MyClass { std::vector<int> data; public: MyClass(MyClass&& other) noexcept : data(std::move(other.data)) {} MyClass& operator=(MyClass&& other) noexcept { if (this != &other) { data = std::move(other.data); } return *this; } }; Smart pointers: std::shared_ptr<Widget> pw1 = std::make_shared<Widget>(); std::weak_ptr<Widget> wpw = pw1; std::unique_ptr<int[]> pints(new int[10]); Rust ownership system: fn main() { let s1 = String::from("hello"); let s2 = s1; // s1 moved to s2, s1 invalid; let s3 = s2.clone(); // deep copy; let len = calculate_length(&s3); // borrowing; } fn calculate_length(s: &String) -> usize { s.len() } fn change(s: &mut String) { s.push_str(", world"); } Pattern matching: match value { Some(x) if x > 0 => println!("Positive: {}", x), Some(x) if x < 0 => println!("Negative: {}", x), Some(0) => println!("Zero"), None => println!("No value"), _ => unreachable!() } Lifetime annotations: fn longest<\'a>(x: &\'a str, y: &\'a str) -> &\'a str { if x.len() > y.len() { x } else { y } } Trait bounds: fn print_debug<T: Debug + Display>(item: &T) { println!("{:?}", item); println!("{}", item); } where clause: fn complex<T, U>(t: &T, u: &U) -> i32 where T: Display + Clone, U: Clone + Debug { /* implementation */ };'
    }


]

async function main() {
    console.log('🚀 Starting to add sample texts...\n')

    for (const textData of sampleTexts) {
        try {
            const text = await prisma.text.create({
                data: textData
            })
            console.log(`✅ Added ${textData.difficulty} text (${textData.time}s) - ${textData.text.substring(0, 50)}...`)
        } catch (error) {
            console.error(`❌ Error adding text:`, error)
        }
    }

    console.log(`\n✨ Done! Added ${sampleTexts.length} sample texts.`)

    // Show summary
    const summary = await prisma.text.groupBy({
        by: ['difficulty', 'time'],
        _count: true
    })

    console.log('\n📊 Text Summary:')
    summary.forEach(s => {
        console.log(`   ${s.difficulty} - ${s.time}s: ${s._count} texts`)
    })
}

main()
    .catch((e) => {
        console.error('Error:', e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
