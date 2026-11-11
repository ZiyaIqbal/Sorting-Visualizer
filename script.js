
const visualizer = document.getElementById("visualizer");
const algorithm = document.getElementById("algorithm");

const randomBtn = document.getElementById("randomBtn");
const startBtn = document.getElementById("startBtn");
const pauseBtn = document.getElementById("pauseBtn");
const resetBtn = document.getElementById("resetBtn");

const speedInput = document.getElementById("speed");
const speedValue = document.getElementById("speedValue");

let original = [];
let arr = [];
let comparisons = 0;
let swaps = 0;
let paused = false;
let stopped = false;
let running = false;
let sortedIndices = new Set();

function generateArray() {
    original = [];

    for (let i = 0; i < 10; i++) {
        original.push(Math.floor(Math.random() * 90) + 10);
    }

    arr = [...original];
    comparisons = 0;
    swaps = 0;
    sortedIndices.clear();

    updateStats();
    render();
    document.getElementById("status").textContent = "Ready";
}

function render(highlight = [], swap = []) {
    visualizer.innerHTML = "";

    arr.forEach((value, index) => {
        const card = document.createElement("div");

        card.className = "card";
        card.textContent = value;

        if (sortedIndices.has(index)) {
            card.classList.add("sorted");
        }

        if (highlight.includes(index)) {
            card.classList.add("comparing");
        }

        if (swap.includes(index)) {
            card.classList.add("swapping");
        }

        visualizer.appendChild(card);
    });
}

function updateStats() {
    document.getElementById("comparisons").textContent = comparisons;
    document.getElementById("swaps").textContent = swaps;
}

function delay() {
    return new Promise(resolve => {
        const check = () => {
            if (stopped) {
                resolve();
                return;
            }

            if (!paused) {
                const time = 1100 - speedInput.value * 100;
                setTimeout(resolve, time);
            } else {
                setTimeout(check, 100);
            }
        };

        check();
    });
}

async function compare(i, j) {
    if (stopped) return;

    comparisons++;
    updateStats();

    render([i, j]);
    await delay();
}

async function exchange(i, j) {
    if (stopped) return;

    [arr[i], arr[j]] = [arr[j], arr[i]];

    swaps++;
    updateStats();

    render([], [i, j]);
    await delay();
}

async function markSorted(index) {
    sortedIndices.add(index);
    render();
    await delay();
}

// BUBBLE SORT
async function bubbleSort() {
    let n = arr.length;

    for (let i = 0; i < n - 1; i++) {
        for (let j = 0; j < n - i - 1; j++) {
            if (stopped) return;

            await compare(j, j + 1);

            if (arr[j] > arr[j + 1]) {
                await exchange(j, j + 1);
            }
        }

        await markSorted(n - i - 1);
    }

    await markSorted(0);
}

// SELECTION SORT
async function selectionSort() {
    let n = arr.length;

    for (let i = 0; i < n - 1; i++) {
        let min = i;

        for (let j = i + 1; j < n; j++) {
            if (stopped) return;

            await compare(min, j);

            if (arr[j] < arr[min]) {
                min = j;
            }
        }

        if (min !== i) {
            await exchange(i, min);
        }

        await markSorted(i);
    }

    await markSorted(n - 1);
}

// INSERTION SORT
async function insertionSort() {
    let n = arr.length;

    for (let i = 1; i < n; i++) {
        let key = arr[i];
        let j = i - 1;

        while (j >= 0) {
            if (stopped) return;

            await compare(j, j + 1);

            if (arr[j] > key) {
                arr[j + 1] = arr[j];
                swaps++;
                updateStats();

                render([], [j, j + 1]);
                await delay();

                j--;
            } else {
                break;
            }
        }

        arr[j + 1] = key;
        render([], [j + 1]);
        await delay();
    }

    for (let i = 0; i < n; i++) {
        sortedIndices.add(i);
    }

    render();
}

// MERGE SORT
async function mergeSort(left, right) {
    if (stopped) return;

    if (left >= right) return;

    let mid = Math.floor((left + right) / 2);

    await mergeSort(left, mid);
    await mergeSort(mid + 1, right);

    if (stopped) return;

    let temp = [];
    let i = left;
    let j = mid + 1;

    while (i <= mid && j <= right) {
        if (stopped) return;

        await compare(i, j);

        if (arr[i] <= arr[j]) {
            temp.push(arr[i]);
            i++;
        } else {
            temp.push(arr[j]);
            j++;
        }
    }

    while (i <= mid) {
        temp.push(arr[i]);
        i++;
    }

    while (j <= right) {
        temp.push(arr[j]);
        j++;
    }

    for (let k = 0; k < temp.length; k++) {
        if (stopped) return;

        arr[left + k] = temp[k];
        swaps++;

        updateStats();
        render([], [left + k]);
        await delay();
    }
}

// QUICK SORT
async function quickSort(low, high) {
    if (stopped) return;

    if (low < high) {
        let pivot = await partition(low, high);

        if (stopped) return;

        await quickSort(low, pivot - 1);
        await quickSort(pivot + 1, high);
    }
}

async function partition(low, high) {
    let pivot = arr[high];
    let i = low - 1;

    for (let j = low; j < high; j++) {
        if (stopped) return low;

        await compare(j, high);

        if (arr[j] < pivot) {
            i++;
            if (i !== j) {
                await exchange(i, j);
            }
        }
    }

    if (i + 1 !== high) {
        await exchange(i + 1, high);
    }

    return i + 1;
}

// START SORTING
async function startSorting() {
    if (running) return;

    running = true;
    paused = false;
    stopped = false;

    comparisons = 0;
    swaps = 0;
    sortedIndices.clear();

    updateStats();

    startBtn.disabled = true;
    randomBtn.disabled = true;
    algorithm.disabled = true;

    document.getElementById("status").textContent = "Sorting...";

    const selected = algorithm.value;

    if (selected === "bubble") {
        await bubbleSort();
    } else if (selected === "selection") {
        await selectionSort();
    } else if (selected === "insertion") {
        await insertionSort();
    } else if (selected === "merge") {
        await mergeSort(0, arr.length - 1);
    } else if (selected === "quick") {
        await quickSort(0, arr.length - 1);
    }

    if (!stopped) {
        sortedIndices.clear();

        for (let i = 0; i < arr.length; i++) {
            sortedIndices.add(i);
        }

        render();
        document.getElementById("status").textContent = "Completed!";
    } else {
        document.getElementById("status").textContent = "Stopped";
    }

    running = false;
    paused = false;

    startBtn.disabled = false;
    randomBtn.disabled = false;
    algorithm.disabled = false;
}

// BUTTON EVENTS
randomBtn.addEventListener("click", () => {
    if (!running) generateArray();
});

startBtn.addEventListener("click", startSorting);

pauseBtn.addEventListener("click", () => {
    if (!running) return;

    paused = !paused;
    pauseBtn.textContent = paused ? "Resume" : "Pause";

    document.getElementById("status").textContent =
        paused ? "Paused" : "Sorting...";
});

resetBtn.addEventListener("click", () => {
    stopped = true;
    paused = false;
    running = false;

    arr = [...original];
    sortedIndices.clear();

    comparisons = 0;
    swaps = 0;

    updateStats();
    render();

    startBtn.disabled = false;
    randomBtn.disabled = false;
    algorithm.disabled = false;

    pauseBtn.textContent = "Pause";
    document.getElementById("status").textContent = "Reset";
});

speedInput.addEventListener("input", () => {
    speedValue.textContent = speedInput.value;
});

// INITIAL DISPLAY
generateArray();
