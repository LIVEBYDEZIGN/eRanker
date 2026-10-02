/* Progressive enhancement: the gold jewelry page is complete without JS. */
(() => {
    const stage = document.querySelector('#rank-scene .rank-stage');
    if (!stage) return;
    const main = stage.querySelector('.rank-surface');
    const standardCard = main.querySelector('.rank-product:not(.rank-product--yours)').cloneNode(true);
    const selectedCard = main.querySelector('.rank-product--yours').cloneNode(true);
    const columns = [[3, 267], [275, 281], [562, 263], [831, 288]];
    const rows = [[3, 254], [263, 253], [523, 251], [781, 277], [1065, 334]];
    const photoBox = index => {
        const [x, width] = columns[index % 4];
        const [y, height] = rows[Math.floor(index / 4)];
        return `${x} ${y} ${width} ${height}`;
    };
    const examples = [
        { id: 'gold', query: 'gold jewelry', slot: 'front', element: main },
        {
            id: 'wallets', query: 'handmade leather wallet', slot: 'left', selected: 1,
            asset: 'assets/page-one/wallet-photography-v2.webp', width: 1448, height: 1086,
            products: [
                ['Espresso leather bifold', 'Bifold'], ['Cognac leather wallet', 'Bifold'],
                ['Tan leather snap wallet', 'Snap closure'], ['Oxblood card holder', 'Card holder'],
                ['Charcoal slim wallet', 'Slim bifold'], ['Olive leather card sleeve', 'Card sleeve'],
                ['Handmade leather wallet', 'Compact bifold'], ['Classic leather bifold', 'Open bifold'],
                ['Leather envelope wallet', 'Envelope style'], ['Navy leather wallet', 'Bifold']
            ]
        },
        {
            id: 'gifts', query: 'gifts for mom', slot: 'right', selected: 2,
            asset: 'assets/page-one/search-photography.webp', width: 1122, height: 1402,
            products: [
                ['Handmade ceramic mug', 'Pottery'], ['Ceramic candle', 'Home fragrance'],
                ['Wildflower watercolor print', 'Wall art'], ['Embroidered floral tote', 'Tote bag'],
                ['Soft blush knit scarf', 'Knitwear'], ['Floral jewelry dish', 'Ceramics'],
                ['Birth flower necklace', 'Jewelry'], ['Lavender soap gift set', 'Bath & body'],
                ['Amber glass tea cup', 'Glassware'], ['Terracotta plant pot', 'Home & garden']
            ]
        }
    ];

    for (const example of examples.slice(1)) {
        const page = main.cloneNode(true);
        page.dataset.example = example.id;
        page.dataset.slot = example.slot;
        const choice = page.querySelector('.rank-search-row');
        choice.id = `rank-choice-${example.id}`;
        choice.setAttribute('aria-label', `View ${example.query} search results`);
        choice.setAttribute('aria-pressed', 'false');
        page.querySelector('.rank-search-icon iconify-icon').setAttribute('icon', 'lucide:arrow-up-right');
        page.querySelector('.rank-query').textContent = example.query;
        const result = page.querySelector('.rank-result-view');
        result.setAttribute('aria-hidden', 'true');
        result.setAttribute('aria-label', `Etsy's first page for ${example.query}. Your ${example.products[example.selected][0].toLowerCase()} is highlighted among several rows of search results. The highlight identifies your listing, not a number-one position.`);
        const cards = example.products.map(([title, kind], index) => {
            const card = (index === example.selected ? selectedCard : standardCard).cloneNode(true);
            card.classList.toggle('rank-product--desktop-only', index === 4);
            card.querySelector('.rank-product-title').textContent = title;
            const type = card.querySelector('.rank-product-kind');
            if (type) type.textContent = kind;
            const svg = card.querySelector('svg');
            svg.setAttribute('viewBox', example.id === 'wallets'
                ? `${(index % 4) * 362} ${Math.floor(index / 4) * 362} 362 362`
                : photoBox(index + 10));
            const image = svg.querySelector('image');
            image.setAttribute('href', example.asset);
            image.setAttribute('width', example.width);
            image.setAttribute('height', example.height);
            return card;
        });
        page.querySelector('.rank-products').replaceChildren(...cards);
        stage.append(page);
        example.element = page;
    }

    const status = document.createElement('p');
    status.className = 'sr-only';
    status.setAttribute('role', 'status');
    status.setAttribute('aria-live', 'polite');
    stage.after(status);

    function select(example, focus = false) {
        if (example.slot !== 'front') {
            const previous = examples.find(item => item.slot === 'front');
            previous.slot = example.slot;
            example.slot = 'front';
            for (const item of examples) {
                const active = item.slot === 'front';
                item.element.dataset.slot = item.slot;
                item.element.querySelector('.rank-search-row').setAttribute('aria-pressed', String(active));
                item.element.querySelector('.rank-search-icon iconify-icon').setAttribute('icon', active ? 'lucide:search' : 'lucide:arrow-up-right');
                item.element.querySelector('.rank-result-view').setAttribute('aria-hidden', String(!active));
            }
            status.textContent = `Page 1: ${example.query}. Your listing is highlighted.`;
        }
        if (focus) example.element.querySelector('.rank-search-row').focus({ preventScroll: true });
    }

    stage.addEventListener('click', event => {
        const page = event.target.closest('.rank-surface');
        if (!page) return;
        const example = examples.find(item => item.element === page);
        if (example) select(example);
    });
    stage.addEventListener('keydown', event => {
        if (!event.target.closest('.rank-search-row')) return;
        const index = examples.findIndex(item => item.element.contains(event.target));
        const direction = { ArrowLeft: -1, ArrowRight: 1 }[event.key];
        let next;
        if (direction) next = (index + direction + examples.length) % examples.length;
        else if (event.key === 'Home') next = 0;
        else if (event.key === 'End') next = examples.length - 1;
        else return;
        event.preventDefault();
        select(examples[next], true);
    });
})();
