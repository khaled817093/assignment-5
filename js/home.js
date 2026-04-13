let currentTab = "all"; 
let allItems = []; 

const updateCount = (count) => {
    const countElement = document.getElementById("issue-count");
    if (countElement) {
        countElement.innerText = count;
    }
};


function switchTab(tab) {
    currentTab = tab; 
    const tabs = ["all", "open", "closed"];
    const headerBanner = document.getElementById("issue-header");
    const wordContainer = document.getElementById("level-details-container");


    tabs.forEach(t => {
        const tabBtn = document.getElementById("tab-" + t);
        if (tabBtn) {
            if (t === tab) {
                tabBtn.classList.add("bg-primary", "text-white", "border-primary");
                tabBtn.classList.remove("bg-transparent", "text-slate-800", "border-slate-300", "text-black");
            } else {
                tabBtn.classList.add("bg-transparent", "text-slate-800", "border-slate-300", "text-black");
                tabBtn.classList.remove("bg-primary", "text-white", "border-primary");
            }
        }
    });

    if (headerBanner) headerBanner.classList.remove("hidden");

    wordContainer.innerHTML = `<div class="col-span-full flex justify-center py-20"><span class="loading loading-bars loading-xl text-primary"></span></div>`;

    setTimeout(() => {
        let filteredItems = [];
        if (tab === "all") {
            filteredItems = allItems;
        } else if (tab === "open") {
            filteredItems = allItems.filter(item => 
                item.priority?.toLowerCase() === "high" || item.priority?.toLowerCase() === "medium"
            );
        } else if (tab === "closed") {
            filteredItems = allItems.filter(item => 
                item.priority?.toLowerCase() === "low"
            );
        }

        displayCards(filteredItems);
        updateCount(filteredItems.length);
    }, 300);
}

const loadAllCards = () => {
    const url = "https://phi-lab-server.vercel.app/api/v1/lab/issues";
    fetch(url)
        .then((res) => res.json())
        .then((data) => {
            allItems = Array.isArray(data) ? data : (data.data || []);
            switchTab('all'); 
        })
        .catch(err => console.error("Error loading data:", err));
};

const displayCards = (items) => {
    const wordContainer = document.getElementById("level-details-container");
    if (!wordContainer) return;

    wordContainer.innerHTML = ""; 

    if (!items || items.length === 0) {
        wordContainer.innerHTML = `<p class="col-span-full text-center py-10 text-gray-400">কোন তথ্য পাওয়া যায়নি।</p>`;
        return;
    }

    items.forEach((item) => {
        const card = document.createElement("div");
        card.onclick = () => loadDetails(item._id || item.id);
        card.style.cursor = "pointer"; 
        
        const priority = (item.priority || "low").toLowerCase();
        let borderColor = (priority === "low") ? "border-purple-500" : "border-green-500";
        let badgeClass = (priority === "high") ? "bg-red-100 text-red-600 border-red-200" : 
                         (priority === "medium") ? "bg-yellow-100 text-yellow-600 border-yellow-200" : 
                         "bg-gray-100 text-gray-600 border-gray-200";

        let statusImage = (priority === "low") ? "./assets/Closed- Status .png" : "./assets/Open-Status.png";
        
        card.className = `bg-white rounded-xl shadow-md p-6 border-t-4 ${borderColor} flex flex-col justify-between h-full hover:shadow-xl transition`;
        
        const date = item.createdAt ? new Date(item.createdAt).toLocaleDateString() : "1/15/2026";
        const displayId = (item._id || item.id || "001").toString().slice(-5);

        card.innerHTML = `
            <div>
                <div class="flex justify-between items-center mb-4">
                    <img class="w-8 h-8" src="${statusImage}" alt="status" onerror="this.src='https://cdn-icons-png.flaticon.com/512/565/565547.png'">
                    <span class="${badgeClass} px-3 py-1 rounded-full text-xs font-bold border capitalize">
                        ${item.priority || 'N/A'}
                    </span>
                </div>
                <h2 class="font-bold text-lg text-gray-800 mb-2 leading-tight">${item.title || "Untitled"}</h2>
                <p class="text-gray-500 text-sm mb-4 line-clamp-3">${item.description || "No description."}</p>
            </div>
            
            <div class="flex gap-2 flex-wrap mb-4">
                <span class="flex items-center gap-1 bg-red-100 text-red-500 px-2 py-1 rounded-full text-[10px] font-bold border border-red-200">
                    <img src="./assets/Vector.png" alt=""> BUG
                </span>
                <span class="flex items-center gap-1 bg-yellow-100 text-yellow-500 px-2 py-1 rounded-full text-[10px] font-bold border border-yellow-200">
                    <img src="./assets/Vector (1).png" alt=""> HELP WANTED
                </span>
            </div>
            
            <div class="mt-auto pt-4 border-t border-gray-100">
                <div class="text-[10px] text-gray-400 flex justify-between items-center">
                    <span class="font-medium">#${displayId} by ${item.author || 'User'}</span>
                    <span>${date}</span>
                </div>
            </div>
        `;
        wordContainer.appendChild(card);
    });
};


const loadDetails = (id) => {
    if (!id) return;
    
    const detailsContainer = document.getElementById("details-view-container");
    detailsContainer.innerHTML = `<div class="flex justify-center py-10"><span class="loading loading-ball loading-lg text-primary"></span></div>`;
    document.getElementById('my_modal_5').showModal();

    const url = `https://phi-lab-server.vercel.app/api/v1/lab/issue/${id}`;
    fetch(url)
        .then(res => res.json())
        .then(data => {
            const item = data.data ? data.data : data;

            setTimeout(() => {
                displayDetails(item);
            }, 500);
        })
        .catch(err => {
            console.error("Error fetching details:", err);
            detailsContainer.innerHTML = `<p class="text-error text-center">Failed to load data.</p>`;
        });
};

const displayDetails = (item) => {
    const detailsContainer = document.getElementById("details-view-container");
    if (!detailsContainer) return;

    const title = item.title || "Untitled";
    const author = item.author || "Unknown User"; 
    const description = item.description || "No description provided.";
    const assignee = item.assignee || "Not Assigned";
    
    let displayDate = "Date N/A";
    const rawDate = item.createdAt || item.date; 
    if (rawDate) {
        displayDate = new Date(rawDate).toLocaleDateString('en-GB'); 
    }

    const currentStatus = currentTab === "closed" ? "CLOSED" : "OPENED";
    const priority = (item.priority || "low").toLowerCase();
    let pClass = priority === "high" ? "bg-red-600" : (priority === "medium" ? "bg-yellow-500" : "bg-green-600");

    detailsContainer.innerHTML = `
        <div class="text-left space-y-4">
            <h2 class="font-bold text-2xl text-gray-800">${title}</h2>
            <div class="flex items-center gap-4">
                <span class="bg-green-700 text-white px-3 py-1 rounded-full text-xs font-bold uppercase">${currentStatus}</span>
                <div class="flex items-center gap-2 text-gray-500 text-sm">
                    <span class="font-semibold text-gray-700">Opened by:</span>
                    <span>${author}</span>
                    <span class="mx-1">|</span>
                    <span>${displayDate}</span>
                </div>
            </div>
            <div class="flex gap-2 flex-wrap mb-4">
                <span class="flex items-center gap-1 bg-red-100 text-red-500 px-2 py-1 rounded-full text-[10px] font-bold border border-red-200">
                    <img src="./assets/Vector.png" alt=""> BUG
                </span>
                <span class="flex items-center gap-1 bg-yellow-100 text-yellow-500 px-2 py-1 rounded-full text-[10px] font-bold border border-yellow-200">
                    <img src="./assets/Vector (1).png" alt=""> HELP WANTED
                </span>
            </div>
            <div class="bg-gray-50 p-4 rounded-lg border border-gray-100">
                <p class="text-gray-700 leading-relaxed">${description}</p>
            </div>
            <div class="grid grid-cols-2 gap-4">
                <div class="bg-gray-50 p-3 rounded-lg">
                    <p class="text-[10px] text-gray-400 font-bold uppercase">Assignee</p>
                    <p class="font-bold text-gray-800">${assignee}</p>
                </div>
                <div class="bg-gray-50 p-3 rounded-lg">
                    <p class="text-[10px] text-gray-400 font-bold uppercase">Priority</p>
                    <span class="inline-block px-3 py-1 rounded-full text-white text-[10px] font-bold ${pClass} capitalize">
                        ${priority}
                    </span>
                </div>
            </div>
            <div class="modal-action">
                <form method="dialog"><button class="btn btn-primary">Close</button></form>
            </div>
        </div>
    `;
};

const handleSearch = () => {
    const searchText = document.getElementById("btn-search").value.trim().toLowerCase();
    const wordContainer = document.getElementById("level-details-container");

    if (searchText === "") {
        switchTab(currentTab); 
        return;
    }

    wordContainer.innerHTML = `<div class="col-span-full flex justify-center py-20"><span class="loading loading-infinity loading-lg text-primary"></span></div>`;

    const url = `https://phi-lab-server.vercel.app/api/v1/lab/issues/search?q=${searchText}`;
    fetch(url)
        .then(res => res.json())
        .then(data => {
            const results = Array.isArray(data) ? data : (data.data || []);
            setTimeout(() => {
                displayCards(results);
                updateCount(results.length);
            }, 300);
        });
};

document.getElementById("btn-search").addEventListener("keyup", handleSearch);
window.onload = loadAllCards;

const newIssueBtn = document.getElementById("newIssueBtn");
if (newIssueBtn) {
    newIssueBtn.onclick = () => {
        document.getElementById("new_issue_modal").showModal();
    };
}

const issueForm = document.getElementById("issue-submit-form");
if (issueForm) {
    issueForm.addEventListener("submit", function(e) {
        e.preventDefault(); // পেজ রিফ্রেশ হওয়া আটকাবে
        
        const usernameField = document.getElementById("form-username");
        const commentField = document.getElementById("form-comment");
        const submitBtn = document.getElementById("submit-btn");

        // যদি ফিল্ডগুলো খুঁজে না পায় তবে এরর দেবে না
        if (!usernameField || !commentField || !submitBtn) {
            console.error("Input fields or Submit button not found in HTML!");
            return;
        }

        const username = usernameField.value;
        const comment = commentField.value;

        // বাটনে লোডিং দেখানো
        submitBtn.innerHTML = `<span class="loading loading-infinity loading-md"></span> Sending...`;
        submitBtn.disabled = true;

        const templateParams = {
            from_name: username, 
            message: comment,    
            to_name: "Khaled Masud"
        };

        // মনে রাখবেন: 'YOUR_SERVICE_ID' এবং 'YOUR_TEMPLATE_ID' অবশ্যই পাল্টাতে হবে
        emailjs.send('YOUR_SERVICE_ID', 'YOUR_TEMPLATE_ID', templateParams)
            .then(function(response) {
                alert("Your problem has been successfully submitted.");
                issueForm.reset(); 
                const modal = document.getElementById("new_issue_modal");
                if (modal) modal.close();
            })
            .catch(function(error) {
                console.error('FAILED...', error);
                alert("Submission failed. Check Console for details.");
            })
            .finally(() => {
                submitBtn.innerText = "Submit Issue";
                submitBtn.disabled = false;
            });
    });
}