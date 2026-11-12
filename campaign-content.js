/* Original AP CSA practice. Code samples and Java test contracts stay in English. */
(() => {
  const quiz = (title, prompt, code, correct, distractors, feedback, frames = []) =>
    ({ type: 'quiz', title, prompt, code, correct, distractors, feedback, frames });
  const lab = (title, prompt, starter, tests, criteria, imports = '') =>
    ({ type: 'lab', title, prompt, starter, tests, criteria, imports });
  const mission = (id, title, topic, briefing, reference, tasks, reflection) =>
    ({ id, title, topic, briefing, reference, tasks, reflection });

  const textLab = lab(['Text analyzer', '文字分析器'],
    ['Implement initials. Each name is nonempty. Return both first letters in uppercase with a period after each. Then add a new example with different name lengths.', '完成 initials。兩個名字都非空。回傳兩個大寫首字母，每個字母後加句點。再用不同長度的名字新增一組測試。'],
    `static String initials(String first, String last) {
    // TODO: implement
    return "";
}`,
    `check(initials("Ada", "Lovelace").equals("A.L."), "Mixed case");
check(initials("q", "z").equals("Q.Z."), "Single-character names");
check(initials("grace", "Hopper").equals("G.H."), "Different input lengths");`,
    ['Uses substring boundaries and keeps case conversion separate from extraction.', '正確使用 substring 的邊界，並分開擷取字元與大小寫轉換。']);

  const accessLab = lab(['Eligibility engine', '資格判定引擎'],
    ['A pilot is cleared if trained and age is at least 16. Otherwise a pilot with a mentor may practice if age is at least 13. Return CLEAR, PRACTICE, or WAIT. A cleared pilot takes priority.', '已受訓且年滿 16 歲可正式飛行。其餘年滿 13 歲且有導師者可練習。回傳 CLEAR、PRACTICE 或 WAIT，正式飛行資格優先。'],
    `static String access(int age, boolean trained, boolean mentor) {
    // TODO: implement
    return "WAIT";
}`,
    `check(access(16, true, true).equals("CLEAR"), "Clear takes priority at age 16");
check(access(16, false, true).equals("PRACTICE"), "Mentor fallback");
check(access(13, false, true).equals("PRACTICE"), "Age 13 inclusive");
check(access(12, true, true).equals("WAIT"), "Too young");
check(access(15, true, false).equals("WAIT"), "Missing mentor");`,
    ['Uses explicit boundary checks and gives the highest eligibility priority.', '明確處理年齡邊界，並優先判定最高資格。']);

  const loopLab = lab(['Battery charge simulator', '電池充電模擬器'],
    ['Return how many rounds it takes to reach or exceed target when each round adds gain. start and target are nonnegative, gain is positive, and inputs are small. Return 0 when the battery already meets the target.', '每輪增加 gain，回傳電量達到或超過 target 所需輪數。start 和 target 非負，gain 為正，數值都不大。若已達標則回傳 0。'],
    `static int rounds(int start, int gain, int target) {
    // TODO: implement using a while loop
    return 0;
}`,
    `check(rounds(3, 4, 15) == 3, "Hits the target");
check(rounds(3, 4, 14) == 3, "Overshoots the target");
check(rounds(15, 4, 15) == 0, "Starts at target");
check(rounds(20, 4, 15) == 0, "Starts above target");`,
    ['Initializes a counter once and updates charge and count together on each iteration.', '只初始化一次計數器，每次迭代同步更新電量和輪數。']);

  const scanLab = lab(['Signal scanner', '訊號掃描器'],
    ['Each letter O is one usable reading. Return the longest consecutive run of O characters in a String containing only O and X. The empty string returns 0. Use a single pass.', '每個 O 代表有效讀值。輸入只含 O 與 X，回傳最長連續 O 的長度。空字串回傳 0，只走訪字串一次。'],
    `static int longestRun(String readings) {
    // TODO: track current and best runs
    return 0;
}`,
    `check(longestRun("OOXOOO") == 3, "Best run at end");
check(longestRun("OOOOXXO") == 4, "Best run at beginning");
check(longestRun("XXX") == 0, "No usable reading");
check(longestRun("") == 0, "Empty string");`,
    ['Resets the current run on X and keeps a separate best value.', '遇到 X 時重設目前長度，另用變數記錄最大值。']);

  const patternLab = lab(['Build a scanner sweep', '建立掃描路徑'],
    ['Return a text pattern with rows lines. Line r, counting from 1, contains exactly r hash signs. Join lines with a newline and omit the final newline. rows is nonnegative.', '回傳 rows 行文字。從 1 起算，第 r 行含 r 個 #。各行用換行分隔，最後一行末尾不加換行。rows 為非負整數。'],
    `static String sweep(int rows) {
    // TODO: use nested loops
    return "";
}`,
    `check(sweep(3).equals("#\\n##\\n###"), "Three rows");
check(sweep(1).equals("#"), "One row without final newline");
check(sweep(0).equals(""), "Zero rows");
check(sweep(4).split("\\n")[3].equals("####"), "Fourth row");`,
    ['Places the inner bound under control of the outer row variable.', '內層迴圈的上限由外層行號決定。']);

  const accountLab = lab(['Build BankAccount', '建立 BankAccount'],
    ['Implement a BankAccount with private balance. The constructor receives a nonnegative opening balance in cents. Deposit only positive amounts. withdraw returns true and subtracts a positive amount if funds suffice, otherwise returns false and leaves the balance unchanged.', '建立含 private balance 的 BankAccount。建構子接收非負的開戶金額，單位為分。只接受正數存款。withdraw 在金額為正且餘額充足時扣款並回傳 true，否則維持原餘額並回傳 false。'],
    `static class BankAccount {
    private int balance;

    BankAccount(int opening) { /* TODO */ }
    int getBalance() { return 0; }
    void deposit(int cents) { /* TODO */ }
    boolean withdraw(int cents) { return false; }
}`,
    `BankAccount a = new BankAccount(200);
BankAccount b = new BankAccount(9);
check(a.getBalance() == 200 && b.getBalance() == 9, "Independent objects");
a.deposit(50);
a.deposit(-1);
check(a.getBalance() == 250, "Positive deposit only");
check(a.withdraw(250) && a.getBalance() == 0, "May empty account");
check(!a.withdraw(1) && !b.withdraw(0), "Reject overspend and zero");
check(b.getBalance() == 9, "Rejected withdrawal keeps balance");`,
    ['Keeps per-account state private and changes it only through valid operations.', '每個帳戶各自保有 private 狀態，只透過有效操作更新。']);

  const teamLab = lab(['Scoreboard class design', '計分板類別設計'],
    ['Each Team has a name and starts with score 0. addPoints accepts only positive values. winner returns the name of the higher-scoring Team, or TIE for equal scores. The static method must work on the two supplied objects without mutating them.', '每個 Team 有名字，初始分數為 0。addPoints 只接受正數。winner 回傳分數較高隊伍的名稱，平手時回傳 TIE。此靜態方法應使用傳入的兩個物件，且不修改它們。'],
    `static class Team {
    private String name;
    private int score;
    Team(String name) { /* TODO */ }
    void addPoints(int points) { /* TODO */ }
    String getName() { return ""; }
    int getScore() { return 0; }
}

static String winner(Team first, Team second) {
    // TODO: compare through accessor methods
    return "TIE";
}`,
    `Team a = new Team("Orion");
Team b = new Team("Nova");
check(winner(a, b).equals("TIE"), "Initial tie");
b.addPoints(4);
a.addPoints(-1);
check(a.getScore() == 0, "Ignore negative points");
check(winner(a, b).equals("Nova"), "Second team wins");
a.addPoints(9);
check(winner(a, b).equals("Orion") && b.getScore() == 4, "First team wins without mutation");`,
    ['Separates updates from queries and uses the Team API from the comparison method.', '將更新操作與查詢分開，並透過 Team 的公開方法比較分數。']);

  const arrayLab = lab(['Build a score analyzer', '建立分數分析器'],
    ['Return the index of the first maximum in scores. An empty array returns -1. Scores can be negative. Keep the input array unchanged.', '回傳 scores 中第一個最大值的索引。空陣列回傳 -1，分數可能為負，且原陣列需維持原樣。'],
    `static int firstMax(int[] scores) {
    // TODO: use an indexed traversal
    return -1;
}`,
    `int[] input = {-4, -2, -2, -9};
check(firstMax(input) == 1, "Negative values and tied maxima");
check(java.util.Arrays.equals(input, new int[]{-4, -2, -2, -9}), "Input remains intact");
check(firstMax(new int[]{}) == -1, "Empty array");
check(firstMax(new int[]{9}) == 0, "Single element");
check(firstMax(new int[]{1, 2, 3}) == 2, "Last element wins");`,
    ['Uses a strict comparison to preserve the earliest index in a tie.', '使用嚴格大於，保留平手時最早出現的索引。']);

  const playlistLab = lab(['Clean a dynamic playlist', '清理動態播放清單'],
    ['Remove every exact occurrence of blocked from tracks in place and return the number removed. Keep the order of the surviving titles. Tracks and titles are non-null.', '直接從 tracks 移除所有與 blocked 完全相同的名稱，回傳移除數量，並維持其餘歌曲的原順序。清單與歌曲名稱都不是 null。'],
    `static int removeTitle(ArrayList<String> tracks, String blocked) {
    // TODO: handle adjacent matches
    return 0;
}`,
    `ArrayList<String> tracks = new ArrayList<>(java.util.Arrays.asList("A", "X", "X", "B", "X"));
check(removeTitle(tracks, "X") == 3, "Counts adjacent and trailing matches");
check(tracks.equals(java.util.Arrays.asList("A", "B")), "Keeps survivor order");
check(removeTitle(tracks, "x") == 0, "Exact case-sensitive match");
check(removeTitle(new ArrayList<String>(), "A") == 0, "Empty list");`,
    ['Accounts for shifted indexes after remove and uses equals for String content.', '考慮 remove 後的索引位移，並以 equals 比較字串內容。'], 'import java.util.ArrayList;');

  const gridLab = lab(['Map the safest column', '尋找最安全的欄'],
    ['Each cell is a risk reading. Return the index of the column with the smallest sum, choosing the first column on ties. The grid is rectangular and has at least one row and one column.', '每格代表一筆風險值。回傳總和最小的欄索引，平手時選最前面的一欄。grid 為矩形，至少有一列與一欄。'],
    `static int safestColumn(int[][] grid) {
    // TODO: compare column totals
    return -1;
}`,
    `check(safestColumn(new int[][]{{8, 1, 4}, {0, 2, 8}}) == 1, "Rectangular 2 by 3 grid");
check(safestColumn(new int[][]{{1, 1}, {2, 2}}) == 0, "Tie chooses first");
check(safestColumn(new int[][]{{8}, {-3}, {4}}) == 0, "Single column");
check(safestColumn(new int[][]{{1, -9, 0}}) == 1, "Single row");`,
    ['Uses row and column dimensions independently and restarts each column total.', '分開使用列數與欄數，並為每一欄重設加總。']);

  const searchLab = lab(['Search the relay archive', '搜尋中繼站檔案'],
    ['Return the index of target in a sorted array of distinct integers, or -1 if absent. Implement iterative binary search. Add a custom test for a target at one endpoint.', '輸入為已排序且元素互異的整數陣列。使用迭代式二分搜尋，回傳 target 索引，找不到時回傳 -1。再為位於端點的目標新增測試。'],
    `static int binaryFind(int[] sorted, int target) {
    // TODO: maintain inclusive low/high bounds
    return -1;
}`,
    `check(binaryFind(new int[]{-4, 2, 5, 9, 30}, 30) == 4, "Right endpoint");
check(binaryFind(new int[]{-4, 2, 5, 9, 30}, -4) == 0, "Left endpoint");
check(binaryFind(new int[]{-4, 2, 5, 9, 30}, 5) == 2, "Middle");
check(binaryFind(new int[]{1, 4, 8, 9}, 5) == -1, "Absent between entries");
check(binaryFind(new int[]{}, 1) == -1, "Empty array");`,
    ['Shrinks the search interval each iteration and relies on the sorted-input precondition.', '每次迭代都縮小搜尋範圍，並依賴輸入已排序的前置條件。']);

  const recursiveLab = lab(['Merge two signal feeds', '合併兩路訊號'],
    ['Implement merge for two sorted arrays. Return a new sorted array containing all values, including duplicates. Then explain where this helper sits in merge sort and what its base case would be.', '合併兩個已排序陣列，回傳新的排序陣列並保留重複值。接著說明此方法在合併排序中如何使用，以及遞迴的基底情況。'],
    `static int[] merge(int[] a, int[] b) {
    // TODO: merge with two reading indexes
    return new int[0];
}`,
    `check(java.util.Arrays.equals(merge(new int[]{1,3,3}, new int[]{2,3,7}), new int[]{1,2,3,3,3,7}), "Interleaving and duplicates");
check(java.util.Arrays.equals(merge(new int[]{}, new int[]{4,5}), new int[]{4,5}), "Empty first array");
check(java.util.Arrays.equals(merge(new int[]{1,2,8}, new int[]{0}), new int[]{0,1,2,8}), "Copy remaining tail");`,
    ['Advances exactly one reading index for each output and copies the unconsumed tail.', '每次輸出只前進其中一個讀取索引，並複製剩餘尾段。']);

  const frqMethod = lab(['FRQ 1 · Schedule charges', 'FRQ 1 · 安排充電'],
    ['Return the number of days needed to reach a target. Day 1 is a regular day. On every third day add bonus; on other days add regular. Inputs are small and gains are positive. If start is already at or above target return 0.', '回傳達到目標所需天數。第 1 天是平日，每逢第 3 天的倍數增加 bonus，其餘天增加 regular。數值小且增量為正。起始已達標就回傳 0。'],
    `static int chargeDays(int start, int target, int regular, int bonus) {
    // TODO: implement the complete method
    return 0;
}`,
    `check(chargeDays(0, 12, 2, 8) == 3, "Third day bonus");
check(chargeDays(0, 13, 2, 8) == 4, "Continues past bonus");
check(chargeDays(7, 7, 2, 8) == 0, "No work required");`,
    ['Award one practice point each for correct initialization, day counting, third-day selection, and stopping with the correct result.', '正確初始化、計算天數、判斷第 3 天的倍數、在正確時機停止並回傳，各給一分練習分。']);

  const frqClass = lab(['FRQ 2 · Design a Locker', 'FRQ 2 · 設計 Locker'],
    ['Implement a Locker with a private capacity and used count. Construct it empty with positive capacity. store returns true and adds an item if space remains. freeSlots returns the remaining capacity.', '實作 Locker，容量與已使用數量都設為 private。建構時傳入正容量，初始為空。有空間時 store 新增一個物品並回傳 true。freeSlots 回傳剩餘容量。'],
    `static class Locker {
    // TODO: declare private fields, constructor and methods
    Locker(int capacity) {}
    boolean store() { return false; }
    int freeSlots() { return 0; }
}`,
    `Locker small = new Locker(1);
Locker big = new Locker(3);
check(small.freeSlots() == 1 && big.freeSlots() == 3, "Constructor and independent state");
check(small.store() && !small.store() && small.freeSlots() == 0, "Capacity boundary");
check(big.store() && big.freeSlots() == 2, "Successful store changes only this object");`,
    ['Score field visibility, initialization, the update guard, and the query independently.', '分開評閱欄位封裝、初始化、更新條件和查詢結果。']);

  const frqList = lab(['FRQ 3 · Keep active readings', 'FRQ 3 · 保留有效讀值'],
    ['Create and return a new ArrayList containing the input values at least as large as threshold, in their original order. Preserve the input list. Values are non-null.', '建立並回傳新 ArrayList，保留所有大於或等於 threshold 的值及原順序。輸入清單需維持原樣，元素皆非 null。'],
    `static ArrayList<Integer> keepActive(ArrayList<Integer> readings, int threshold) {
    // TODO: build a separate result list
    return new ArrayList<Integer>();
}`,
    `ArrayList<Integer> values = new ArrayList<>(java.util.Arrays.asList(5, 2, 5, 7));
ArrayList<Integer> kept = keepActive(values, 5);
check(kept.equals(java.util.Arrays.asList(5, 5, 7)), "Threshold, duplicates and order");
check(kept != values && values.equals(java.util.Arrays.asList(5, 2, 5, 7)), "Independent result");
check(keepActive(values, 8).isEmpty(), "No matching entries");`,
    ['Score result construction, full traversal, inclusive condition, and correct addition in order.', '評閱新清單建立、完整走訪、含等號的條件及依序加入。'], 'import java.util.ArrayList;');

  const frqGrid = lab(['FRQ 4 · Count active rows', 'FRQ 4 · 計算有效列'],
    ['Return how many rows of a rectangular grid contain at least one value greater than limit. A row counts at most once. The grid may have zero rows. Explain the loop structure before writing.', '回傳矩形網格中至少含一個大於 limit 的值的列數。每列最多計一次，網格可能沒有任何列。先說明迴圈結構再動手寫。'],
    `static int activeRows(int[][] grid, int limit) {
    // TODO: count rows, not cells
    return 0;
}`,
    `check(activeRows(new int[][]{{7, 8, 0}, {2, 2, 2}, {0, 0, 6}}, 5) == 2, "Multiple matches in one row count once");
check(activeRows(new int[][]{{5, 5}}, 5) == 0, "Strict threshold");
check(activeRows(new int[0][0], 1) == 0, "No rows");`,
    ['Score traversal, strict comparison, per-row reset or early exit, and the final count.', '評閱走訪、嚴格大於、逐列重設或提早結束，以及最終計數。']);

  const integrationLab = lab(['Connect the monitoring modules', '串接監控模組'],
    ['Return the number of grid rows that contain a reading at least threshold. Call hasActiveReading for each row. Implement the helper with an early return and use its boolean result in the report method. The input may have empty rows.', '回傳至少含一筆大於或等於 threshold 讀值的列數。每列呼叫 hasActiveReading。輔助方法找到符合值時提早回傳，報表方法依其布林結果計數。輸入可能包含空列。'],
    `static boolean hasActiveReading(int[] row, int threshold) {
    // TODO: scan a single row
    return false;
}

static int monitor(int[][] grid, int threshold) {
    // TODO: call hasActiveReading for each row
    return 0;
}`,
    `check(hasActiveReading(new int[]{2, 7}, 7), "Inclusive helper boundary");
check(!hasActiveReading(new int[]{}, 7), "Empty row");
check(monitor(new int[][]{{1, 2}, {7, 9}, {}, {8}}, 7) == 2, "Each qualifying row counted once");
check(monitor(new int[][]{}, 7) == 0, "No rows");`,
    ['Keeps one responsibility in each method. The report delegates the row search and only counts qualifying rows.', '每個方法各自負責一件事。報表方法將列內搜尋交給輔助方法，只計算符合條件的列。']);

  const mockLab = lab(['Mock FRQ · Longest stable streak', '模擬 FRQ · 最長穩定區間'],
    ['A reading is stable if low <= reading <= high. Return the length of the longest consecutive stable streak. low <= high. Handle empty input and a longest streak ending at the final element.', '若 low <= reading <= high，該讀值算穩定。回傳最長連續穩定區間的長度。low <= high，須處理空陣列及最長區間出現在末尾。'],
    `static int stableStreak(int[] readings, int low, int high) {
    // TODO: write your response before running tests
    return 0;
}`,
    `check(stableStreak(new int[]{2, 3, 9, 2, 4, 3}, 2, 4) == 3, "Longest streak at the end");
check(stableStreak(new int[]{2, 4}, 2, 4) == 2, "Both bounds included");
check(stableStreak(new int[]{9, 8}, 2, 4) == 0, "No stable readings");
check(stableStreak(new int[]{}, 2, 4) == 0, "Empty input");`,
    ['Score initialization, traversal, inclusive range, reset, and best-so-far update. Record one revision after the timed attempt.', '評閱初始化、走訪、含邊界的範圍、重設及最大值更新。限時作答後記錄一項修正。']);

  window.campaignLessons = [
    mission(3, ['Signal Library', '訊號圖書館'], ['Objects, methods & Strings', '物件、方法與字串'],
      ['The city archive received names with inconsistent labels. Read the Java API, trace a message transformation, and ship an analyzer that works on new names.', '城市檔案館收到格式不一致的名字。閱讀 Java API、追蹤訊息的變化，再寫出能處理不同名字的分析器。'],
      ['String indexes start at 0. substring(begin, end) includes begin and excludes end. String methods return a value; they do not alter the original String.', '字串索引從 0 開始。substring(begin, end) 包含 begin，但不包含 end。字串方法回傳值，原字串維持原樣。'], [
        quiz(['Open the API', '打開 API'], ['Which expression creates a String from the text LOG?', '哪個運算式會從 LOG 文字建立 String 物件？'], '', 'new String("LOG")', ['String("LOG")', 'String.new("LOG")', 'new String.LOG()'], ['A constructor call uses new, a class name, and a parameter list.', '呼叫建構子要使用 new、類別名稱與參數清單。']),
        quiz(['Slice the message', '切割訊息'], ['What is printed?', '會印出什麼？'], 'String s = "DRONE";\nString part = s.substring(1, 4);\nSystem.out.println(part);', 'RON', ['RON E', 'RONE', 'DRO'], ['Indexes 1, 2, and 3 are copied. Index 4 is excluded.', '複製索引 1、2、3，不含索引 4。'], ['D  R  O  N  E', '0  1  2  3  4', '   R  O  N']),
        quiz(['Repair the display', '修復顯示'], ['Which statement updates label with its uppercase text?', '哪一行會將 label 更新為其大寫內容？'], 'String label = "dock";', 'label = label.toUpperCase();', ['label.toUpperCase();', 'Math.toUpperCase(label);', 'label = "dock".length();'], ['Assign the String returned by the method. Calling it alone discards that value.', '把方法回傳的字串指定給 label。只呼叫方法會捨棄回傳值。']),
        quiz(['Calibrate the range', '校準範圍'], ['What is printed by the nested static calls?', '巢狀靜態方法呼叫會印出什麼？'], 'System.out.println(Math.max(3, Math.abs(-8)));', '8', ['3', '-8', '11'], ['The inner Math.abs call produces 8, then max compares 3 and 8.', '內層 Math.abs 先得到 8，接著 max 比較 3 和 8。']), textLab
      ], ['Explain why a one-character name works with your substring bounds. Give an example input the method contract excludes.', '說明為何只有一個字元的名字也能使用你的 substring 邊界。舉出一個規格排除的輸入。']),
    mission(4, ['Checkpoint Gate', '檢查站大門'], ['Boolean logic & selection', '布林邏輯與條件選擇'],
      ['A drone gate is admitting pilots in the wrong order. Investigate its rules, choose the right branch, and rebuild its controller.', '無人機檢查站的資格判定順序出錯。調查規則、選出正確分支，再重建控制程式。'],
      ['&& requires both conditions. || requires at least one. ! negates a result. An if / else-if chain runs the first true branch only.', '&& 要求兩個條件都成立，|| 至少一個成立，! 反轉結果。if / else-if 只執行第一個成立的分支。'], [
        quiz(['Check the boundary', '確認邊界'], ['Which condition includes 16 and 18?', '哪個條件包含 16 和 18 這兩個邊界？'], '', 'age >= 16 && age <= 18', ['age > 16 && age < 18', 'age >= 16 || age <= 18', 'age <= 16 && age >= 18'], ['Both bounds must be true, and >= and <= include equality.', '兩個邊界都必須成立，>= 和 <= 包含等於。']),
        quiz(['Trace the gate', '追蹤大門判定'], ['Which label is printed?', '會印出哪個標籤？'], 'int age = 16;\nif (age >= 13) System.out.print("PRACTICE");\nelse if (age >= 16) System.out.print("CLEAR");', 'PRACTICE', ['CLEAR', 'PRACTICECLEAR', '(no output)'], ['The first condition is true, so the second branch is skipped.', '第一個條件成立，所以不會執行第二個分支。'], ['age = 16', '16 >= 13 → true', 'PRACTICE']),
        quiz(['Rewrite the alarm', '重寫警報條件'], ['Which expression is equivalent to !(trained && mentor)?', '哪個運算式等價於 !(trained && mentor)？'], '', '!trained || !mentor', ['!trained && !mentor', 'trained || mentor', '!(trained || mentor)'], ['Negate each condition and switch AND to OR.', '分別反轉兩個條件，並將 AND 改成 OR。']), accessLab
      ], ['Give two boundary cases and a case where both practice and clearance could apply.', '列出兩個邊界測試，以及一個同時符合練習與正式飛行資格的例子。']),
    mission(5, ['Battery Rounds', '電池充電回合'], ['Iteration with while & for', 'while 與 for 迴圈'],
      ['The emergency battery must charge until it reaches a target. Track each round, repair a nonterminating loop, and build the simulator.', '緊急電池必須持續充到目標值。追蹤每一輪、修正不會結束的迴圈，再完成模擬器。'],
      ['A while loop checks before each iteration. A for loop groups initialization, condition, and update. A sentinel ends a scan and usually is not processed as data.', 'while 每輪開始前檢查條件。for 把初始化、條件和更新放在一起。哨兵值用來結束讀取，通常不當成資料處理。'], [
        quiz(['Count the rounds', '計算輪數'], ['How many times does the body execute?', '迴圈本體執行幾次？'], 'for (int i = 1; i <= 5; i += 2) {\n    System.out.print(i);\n}', '3', ['2', '5', '6'], ['The body runs for i = 1, 3, and 5.', '本體在 i 為 1、3、5 時執行。'], ['i = 1 → print 1', 'i = 3 → print 3', 'i = 5 → print 5', 'i = 7 → stop']),
        quiz(['Stop at the signal', '辨識結束訊號'], ['Add readings until -1 appears. What total should be returned for 4, 7, -1, 20?', '將讀值相加，遇到 -1 停止。4、7、-1、20 的總和應為多少？'], '', '11', ['10', '30', '31'], ['The sentinel and everything after it are excluded.', '哨兵值及其後的資料都不計入。']),
        quiz(['Repair the update', '修正更新'], ['Which replacement update makes this loop reach its target?', '替換成哪個更新指令可讓迴圈達到目標？'], 'int charge = 0;\nwhile (charge < 12) {\n    charge -= 3;\n}', 'charge += 3;', ['charge = 3;', 'charge -= 6;', 'charge = charge;'], ['Increasing charge by 3 eventually makes charge < 12 false.', '每輪增加 3，最後 charge < 12 會變成 false。']), loopLab
      ], ['Trace start 3, gain 4, target 14. Why is the final charge allowed to exceed the target?', '追蹤 start 3、gain 4、target 14。為什麼最後電量可以超過目標？']),
    mission(6, ['Signal Scanner', '訊號掃描站'], ['Standard iterative algorithms', '標準迭代演算法'],
      ['A long transmission mixes clear signals and gaps. Keep track of local and best results, then write a scanner that finds the strongest streak.', '長訊號混合了清楚訊號與中斷。分別記錄目前與最佳結果，再寫出能找到最長有效訊號的掃描器。'],
      ['An accumulator summarizes values seen so far. A flag records whether a condition has ever been met. When scanning characters with substring, i + 1 can be the String length.', '累加變數彙整目前讀過的值，旗標記錄某條件是否曾成立。用 substring 逐字走訪時，i + 1 可以等於字串長度。'], [
        quiz(['Scan a digit', '讀取個位數'], ['What are digit and n after these statements?', '這些指令執行後，digit 與 n 為何？'], 'int n = 472;\nint digit = n % 10;\nn = n / 10;', 'digit = 2, n = 47', ['digit = 47, n = 2', 'digit = 4, n = 72', 'digit = 2, n = 47.2'], ['Remainder gives the final digit, and integer division removes it.', '餘數取得最後一位數，整數除法移除該位數。']),
        quiz(['Track two counters', '追蹤兩個計數'], ['For OOXOOO, what is the longest run of O?', 'OOXOOO 中最長的連續 O 有多長？'], '', '3', ['2', '5', '6'], ['X ends the current run. The final run of three beats the first run of two.', 'X 結束目前的連續區間，最後連續三個 O 比前面的兩個長。'], ['O → current 1, best 1', 'O → current 2, best 2', 'X → current 0, best 2', 'O O O → current 3, best 3']),
        quiz(['Recover a maximum', '找回最大值'], ['What is the safest initial maximum when the input array is nonempty and can contain any int?', '輸入陣列非空且可含任意 int 時，最大值的安全初值為何？'], '', 'values[0]', ['0', 'values.length', '1'], ['An actual input value is a valid starting candidate, even when all values are negative.', '取輸入本身作為候選，即使所有值都為負也適用。']),
        quiz(['Average without truncation', '保留平均值的小數'], ['sum is 11 and count is 4. Which expression gives 2.75?', 'sum 為 11、count 為 4。哪個運算式得到 2.75？'], '', '(double) sum / count', ['(double) (sum / count)', 'sum / count', '(int) sum / count'], ['Cast before dividing. Casting an already-truncated quotient cannot restore the fraction.', '除法前先轉型，才能保留小數。']), scanLab
      ], ['Show where your current run resets and why best must survive that reset.', '指出目前長度在哪裡重設，並說明為何最大值需保留下來。']),
    mission(7, ['Pattern Studio', '圖樣工作室'], ['Nested iteration & runtime', '巢狀迴圈與執行時間'],
      ['The district display needs a sweep pattern that changes size without breaking. Count the work, then program the exact output.', '區域顯示器需要可變換大小的掃描圖樣。先計算執行次數，再寫出格式精確的輸出。'],
      ['Read the inner-loop bounds for each outer-loop value. Independent bounds often multiply; triangular bounds sum a series.', '對每個外層變數值檢查內層迴圈上限。獨立的迴圈上限通常相乘，三角形上限則是數列加總。'], [
        quiz(['Count the grid', '計算格數'], ['How many calls to print execute?', 'print 呼叫執行幾次？'], 'for (int r = 0; r < 3; r++)\n    for (int c = 0; c < 4; c++)\n        System.out.print("#");', '12', ['7', '9', '16'], ['Each of three rows runs the inner loop four times.', '三列的每一列都執行四次內層迴圈。']),
        quiz(['Trace a triangle', '追蹤三角形'], ['How many symbols print in total?', '總共印出幾個符號？'], 'for (int r = 1; r <= 4; r++)\n    for (int c = 1; c <= r; c++)\n        System.out.print("#");', '10', ['4', '8', '16'], ['The inner bounds produce 1 + 2 + 3 + 4.', '內層每列執行次數為 1 + 2 + 3 + 4。'], ['r = 1 → #', 'r = 2 → ##', 'r = 3 → ###', 'r = 4 → ####']),
        quiz(['Estimate the work', '估算執行次數'], ['When n doubles in an n by n traversal, about how many times as many cell visits occur?', 'n × n 的走訪中，n 變成兩倍後，造訪格數約是原本的幾倍？'], '', '4×', ['2×', '3×', '8×'], ['Both dimensions double, so 2 × 2 gives 4 times the visits.', '兩個維度都加倍，因此走訪次數變成 2 × 2，也就是四倍。']), patternLab
      ], ['Explain why the inner bound grows each row. Count visits for rows = 5 and estimate how they grow as rows increases.', '說明為何每列的內層上限會增加。計算 rows = 5 時的次數，再估計 rows 變大時如何成長。']),
    mission(8, ['Vault Ledger', '金庫帳本'], ['Class design and encapsulation', '類別設計與封裝'],
      ['Different accounts are accidentally sharing a balance. Inspect the constructor and fields, then build a ledger that keeps each account independent.', '不同帳戶意外共用餘額。檢查建構子與欄位，再建構讓每個帳戶彼此獨立的帳本。'],
      ['Private instance fields belong to one object. A constructor initializes a new object and has no return type. this.field identifies the current object’s field.', 'private 實例欄位屬於單一物件。建構子初始化新物件，且沒有回傳型別。this.field 指目前物件的欄位。'], [
        quiz(['Separate the accounts', '分開帳戶狀態'], ['Which declaration stores an independent balance for each account?', '哪個宣告讓每個帳戶都有自己的餘額？'], '', 'private int balance;', ['private static int balance;', 'public static int balance;', 'int balance()'], ['A non-static field is stored per instance. private protects direct access.', '非 static 欄位各實例獨立儲存。private 限制直接存取。']),
        quiz(['Fix the constructor', '修正建構子'], ['Which line copies the parameter into the field?', '哪行會把參數存入欄位？'], 'private int balance;\nBankAccount(int balance) {\n    // replace this line\n}', 'this.balance = balance;', ['balance = balance;', 'balance = this.balance;', 'int balance = this.balance;'], ['this.balance names the field; balance alone names the parameter.', 'this.balance 指欄位，單寫 balance 指參數。']),
        quiz(['Trace the ledger', '追蹤帳本'], ['What is a’s balance after these calls, assuming the specified class behavior?', '依本課的帳戶規格，呼叫後 a 的餘額為何？'], 'BankAccount a = new BankAccount(50);\na.deposit(20);\na.withdraw(80);', '70', ['-10', '0', '50'], ['The deposit adds 20. A withdrawal larger than the balance is rejected.', '存入 20 後餘額為 70。提款超過餘額時會被拒絕。'], ['open: 50', 'deposit 20: 70', 'withdraw 80: false, 70']), accountLab
      ], ['Explain why a public balance field could break the class rules. Describe a failed withdrawal test.', '說明 public 餘額欄位為何可能破壞類別規則，並描述一個提款失敗的測試。']),
    mission(9, ['Scoreboard Relay', '計分板中繼站'], ['Methods and interacting classes', '方法與類別互動'],
      ['Two teams send results to a shared display. Decide which methods query and which update, then build the comparison without changing either team.', '兩隊將結果送到共用顯示器。分辨哪些方法負責查詢與更新，再實作不改變隊伍狀態的比較功能。'],
      ['An instance method acts on an object. A static method can receive objects as parameters. A void method performs an action; a non-void method returns a value.', '實例方法作用在物件上，靜態方法可接收物件參數。void 方法執行動作，非 void 方法回傳值。'], [
        quiz(['Select the method', '選擇方法型別'], ['Which signature directly returns an integer score?', '哪個方法宣告可直接回傳整數分數？'], '', 'public int getScore()', ['public void getScore()', 'public boolean getScore()', 'public Team getScore()'], ['The declared return type matches the value a caller needs.', '宣告的回傳型別需符合呼叫者需要的資料。']),
        quiz(['Trace aliasing', '追蹤別名'], ['What is printed if a Team starts at 0 and addPoints adds its argument?', '若 Team 初始為 0，且 addPoints 會加入參數值，則印出什麼？'], 'Team a = new Team("Nova");\nTeam b = a;\nb.addPoints(4);\nSystem.out.print(a.getScore());', '4', ['0', '8', '(compile error)'], ['Both references point to the same Team object.', '兩個參照都指向同一個 Team 物件。'], ['a → Team Nova, score 0', 'b → same Team', 'b.addPoints(4) → score 4']),
        quiz(['Use the class API', '使用類別 API'], ['Which line lets a separate Scoreboard class access a private score through a public method?', '哪行讓另一個 Scoreboard 類別透過公開方法取得 private 分數？'], '', 'int score = a.getScore();', ['int score = a.score;', 'int score = Team.getScore();', 'int score = a.getScore;'], ['Use the instance accessor on the supplied Team object.', '在傳入的 Team 物件上呼叫實例查詢方法。']), teamLab
      ], ['Identify one method that mutates a Team and one that does not. Explain why winner can be static.', '指出一個會更新 Team 的方法與一個只做查詢的方法，並解釋 winner 為何可以是 static。']),
    mission(10, ['Score Array Archive', '分數陣列檔案室'], ['One-dimensional arrays', '一維陣列'],
      ['The archive has fixed-length score records. Inspect its indexes and recover the first location of the best score.', '檔案室的分數紀錄使用固定長度陣列。檢查索引並找出最高分第一次出現的位置。'],
      ['An array has fixed length. Its last valid index is length - 1. Use an indexed loop when you need the location; an enhanced for loop gives each value.', '陣列長度固定，最後有效索引為 length - 1。需要位置時用索引迴圈，增強型 for 則提供各元素的值。'], [
        quiz(['Find the last cell', '找最後一格'], ['What is the last valid index of new int[6]?', 'new int[6] 的最後有效索引為何？'], '', '5', ['6', '0', '7'], ['Six elements occupy indexes 0 through 5.', '六個元素使用索引 0 到 5。']),
        quiz(['Trace the scan', '追蹤陣列走訪'], ['What value does total store?', 'total 儲存什麼值？'], 'int[] scores = {4, -1, 6};\nint total = 0;\nfor (int score : scores) total += score;', '9', ['10', '11', '3'], ['The running sum is 4, then 3, then 9.', '累加結果依序為 4、3、9。'], ['start: 0', 'add 4: 4', 'add -1: 3', 'add 6: 9']),
        quiz(['Break a tie correctly', '正確處理平手'], ['Which test updates best only when a strictly larger value appears?', '哪個條件只在出現更大的值時更新 best？'], '', 'scores[i] > scores[best]', ['scores[i] >= scores[best]', 'i > best', 'scores[i] < scores[best]'], ['Using > preserves the first occurrence of a tied maximum.', '使用 > 會保留平手時第一次出現的位置。']),
        quiz(['Choose a safer dataset', '選擇更合適的資料'], ['Your class needs to show how a score algorithm works. Which dataset avoids collecting personal information?', '班上要展示分數演算法，哪一組資料可以避免蒐集個人資訊？'], '', ['Made-up scores with no names', '無姓名的自編分數'], [['Class grades with names', '含姓名的班級成績'], ['Student IDs with grades', '含學號的成績'], ['Screenshots of personal score reports', '個人分數報表截圖']], ['Made-up values are enough to exercise the same array behavior.', '自編數值也能展示同樣的陣列行為。']), arrayLab
      ], ['Trace your indexes for {-4, -2, -2, -9}. Explain what would change if the comparison used >=.', '追蹤 {-4, -2, -2, -9} 的索引，並說明使用 >= 會有何改變。']),
    mission(11, ['Playlist Station', '播放清單電台'], ['ArrayList and changing indexes', 'ArrayList 與索引位移'],
      ['The station must remove a blocked track wherever it appears. Test what happens when indexes shift, then fix the playlist in place.', '電台要移除清單中每一筆被封鎖的歌曲。測試刪除後的索引位移，再直接修正原清單。'],
      ['ArrayList size can change. get reads, set replaces, add inserts, and remove shifts later elements left. ArrayList<Integer> uses the wrapper type Integer.', 'ArrayList 長度可改變。get 讀取、set 替換、add 插入、remove 讓後面的元素左移。ArrayList<Integer> 使用包裝型別 Integer。'], [
        quiz(['Read the API', '閱讀清單 API'], ['Which call replaces the item at index 1 while keeping the size?', '哪個呼叫會替換索引 1 的元素，並維持清單長度？'], '', 'tracks.set(1, "B")', ['tracks.add(1, "B")', 'tracks.get(1)', 'tracks.remove(1)'], ['set replaces a slot. add inserts another element.', 'set 替換既有元素，add 則插入新元素。']),
        quiz(['Observe the shift', '觀察索引位移'], ['If a forward loop removes X at index 1 and then increments i, which item does it inspect next?', '若正向迴圈移除索引 1 的 X 後立刻將 i 加一，接下來檢查哪個元素？'], 'tracks = [A, X, X, B]', 'B', ['The second X', 'A', '(no element)'], ['The remaining X shifts to index 1. Incrementing i goes to index 2, now B.', '剩下的 X 左移至索引 1。i 加一後到索引 2，也就是 B。'], ['[A, X, X, B], i = 1', 'remove(1) → [A, X, B]', 'i = 2 → B']),
        quiz(['Choose a safe walk', '選擇安全走法'], ['Which loop header supports removing the current item without skipping an earlier index?', '哪個迴圈宣告可移除目前元素，同時不會跳過前面的索引？'], '', 'for (int i = tracks.size() - 1; i >= 0; i--)', ['for (int i = 0; i <= tracks.size(); i++)', 'for (int i = 0; i < tracks.size(); i++)', 'for (int i = tracks.size(); i >= 0; i--)'], ['Walking backwards keeps unvisited elements at their original earlier indexes.', '反向走訪時，尚未造訪的元素會留在前面的原索引。']), playlistLab
      ], ['Explain why your method handles adjacent matches, and predict what happens when every track matches.', '說明你的方法為何能處理相鄰的符合項目，並預測所有歌曲皆符合時的結果。']),
    mission(12, ['Terrain Grid', '地形網格'], ['Two-dimensional arrays', '二維陣列'],
      ['The city needs a safe column through a risk map. Locate the right cells and compare column totals on a rectangular grid.', '城市需要在風險地圖中找到安全欄位。定位正確的格子，並比較矩形網格各欄總和。'],
      ['grid.length is the row count. For a rectangular nonempty grid, grid[0].length is the column count. grid[r][c] selects row r, column c.', 'grid.length 是列數。非空矩形網格的 grid[0].length 是欄數。grid[r][c] 指第 r 列、第 c 欄。'], [
        quiz(['Locate a reading', '定位讀值'], ['What is grid[1][2]?', 'grid[1][2] 的值為何？'], 'int[][] grid = {{8, 1, 4}, {0, 2, 9}};', '9', ['2', '4', '8'], ['Row index 1 is the second row. Column index 2 is its third entry.', '索引 1 是第二列，索引 2 是其中第三個元素。']),
        quiz(['Trace the route', '追蹤走訪順序'], ['Which sequence is row-major order?', '哪個順序是逐列走訪？'], 'int[][] grid = {{1, 2, 3}, {4, 5, 6}};', '1, 2, 3, 4, 5, 6', ['1, 4, 2, 5, 3, 6', '6, 5, 4, 3, 2, 1', '1, 2, 4, 5, 3, 6'], ['Finish each row before moving down to the next row.', '先走完一整列，再移到下一列。'], ['row 0 → 1, 2, 3', 'row 1 → 4, 5, 6']),
        quiz(['Fix a rectangular bound', '修正矩形邊界'], ['Which is the correct column condition when visiting row r?', '走訪第 r 列時，哪個欄索引條件正確？'], '', 'c < grid[r].length', ['c <= grid[r].length', 'c < grid.length', 'c <= grid.length'], ['Each row is its own array. The column index must be below its length.', '每一列本身是陣列，欄索引需小於該列的長度。']), gridLab
      ], ['Show the three column totals for the 2 by 3 test and explain why row count cannot be used as column count.', '寫出 2 × 3 測試中三欄的總和，並解釋為何列數不能當作欄數。']),
    mission(13, ['Algorithm Relay', '演算法中繼站'], ['Search, sort & recursion', '搜尋、排序與遞迴'],
      ['Recover a sorted archive, compare three ways to sort, and follow a recursive return chain before testing two algorithms.', '復原排序檔案，比較三種排序方式，再追蹤遞迴的回傳過程並測試兩個演算法。'],
      ['Linear search can scan unsorted data. Binary search repeatedly discards half of a sorted interval. Selection chooses an extremum, insertion grows a sorted prefix, and merge sort splits then combines. Recursive calls need a base case and a smaller subproblem.', '線性搜尋可走訪未排序資料。二分搜尋每次淘汰已排序區間的一半。選擇排序挑選極值，插入排序逐步擴大排序前段，合併排序先切分再合併。遞迴需要基底情況與更小的子問題。'], [
        quiz(['Choose the search', '選擇搜尋法'], ['Which search can find a target without first ordering an arbitrary list?', '哪種搜尋可以直接在未排序清單中找目標？'], '', ['Linear search', '線性搜尋'], [['Binary search', '二分搜尋'], ['Merge sort', '合併排序'], ['Insertion sort', '插入排序']], ['Linear search tests items individually without depending on their order.', '線性搜尋逐一檢查元素，不依賴排列順序。']),
        quiz(['Shrink the search interval', '縮小搜尋範圍'], ['The sorted array is {2, 5, 8, 12, 18}. If target is 12 and mid is 2, what should low become?', '已排序陣列為 {2, 5, 8, 12, 18}。target 為 12、mid 為 2，low 應變成多少？'], '', '3', ['2', '1', '4'], ['8 is too small, so all indexes up to and including 2 can be discarded.', '8 小於目標，所以包含索引 2 在內的左半段都可以排除。'], ['low = 0, high = 4, mid = 2', 'sorted[2] = 8 < 12', 'low = 3, high = 4', 'mid = 3 → found']),
        quiz(['Identify the sorting move', '辨認排序步驟'], ['Which standard sort repeatedly chooses the smallest item from the unsorted suffix?', '哪種排序每次從尚未排序的後段選出最小元素？'], '', ['Selection sort', '選擇排序'], [['Insertion sort', '插入排序'], ['Merge sort', '合併排序'], ['Binary search', '二分搜尋']], ['Selection sort selects one extremum and places it in its final position each pass.', '選擇排序每輪選出一個極值並放到最終位置。']),
        quiz(['Trace recursive returns', '追蹤遞迴回傳'], ['What is total(4)?', 'total(4) 的回傳值為何？'], 'static int total(int n) {\n    if (n <= 0) return 0;\n    return n + total(n - 2);\n}', '6', ['4', '10', '0'], ['The call chain is 4 + 2 + 0. Each return adds its own n.', '呼叫鏈為 4 + 2 + 0，每層回傳都加上當層的 n。'], ['total(4) waits for total(2)', 'total(2) waits for total(0)', 'total(0) returns 0', 'total(2) returns 2', 'total(4) returns 6']),
        quiz(['Grow the sorted prefix', '擴大已排序前段'], ['In insertion sort, the sorted prefix is {2, 6, 9} and the next item is 5. What is the new prefix?', '插入排序的已排序前段為 {2, 6, 9}，下一個元素是 5。新的前段為何？'], '', '2, 5, 6, 9', ['5, 2, 6, 9', '2, 6, 9, 5', '9, 6, 5, 2'], ['Shift 9 and 6 one position to the right, then place 5 after 2.', '將 9 和 6 各往右移一格，再把 5 放在 2 後面。']), searchLab, recursiveLab
      ], ['Compare a failed binary search with a linear scan. Then explain how merge sort uses your merge method and a base case.', '比較找不到目標時的二分搜尋與線性搜尋，再說明合併排序如何使用 merge 方法和基底情況。']),
    mission(14, ['Four-Part FRQ Sprint', '四類 FRQ 衝刺'], ['Integrated project & FRQ workshop', '整合專題與 FRQ 工作坊'],
      ['The city team hands you four independent relay modules. Implement each contract, run the published checks, and review your work with your tutor before connecting them.', '城市小組交給你四個獨立模組。依各自規格實作，執行測試，與老師一起評閱後再規劃如何串接。'],
      ['Before writing, underline the return type, mutation rules, and edge cases. For the integration exercise, describe how scheduling, storage, filtering, and grid monitoring could share one relay workflow.', '寫程式前圈出回傳型別、是否修改資料與邊界情況。整合練習請說明排程、儲存、篩選和網格監測如何接成同一流程。'], [
        quiz(['Read a contract', '閱讀方法規格'], ['Which requirement means the caller’s input list must still contain its original items afterward?', '哪個規格表示方法呼叫後，輸入清單仍須保有原元素？'], '', ['Return a new list and preserve the input.', '回傳新清單並保留輸入。'], [['Remove items in place.', '直接移除原清單項目。'], ['Replace every match.', '替換所有符合項目。'], ['Sort the input before filtering.', '先排序輸入再篩選。']], ['A separate result lets the caller keep its original list.', '建立獨立結果可讓呼叫者保留原清單。']),
        frqMethod, frqClass, frqList, frqGrid, integrationLab
      ], ['Identify your weakest FRQ category, cite one specific revision, and sketch how the four modules would work together in a relay monitoring system.', '找出最弱的 FRQ 類型，列出一項具體修正，並畫出四個模組如何在中繼站監控系統裡協作。']),
    mission(15, ['Citywide Systems Check', '全城系統總檢查'], ['Timed mini-mock and final review', '限時迷你模考與總複習'],
      ['Run a timed mixed-unit checkpoint, write one free-response method, then prepare a personal review plan from the evidence.', '完成跨單元限時檢核、撰寫一道自由作答方法題，再根據作答紀錄擬定個人複習計畫。'],
      ['For this original mini-mock, give yourself 18 minutes for eight questions and 25 minutes for the free response. Record your first answers before opening feedback, and review the results afterward.', '本迷你模考含八題，建議限時 18 分鐘，再用 25 分鐘完成自由作答題。先記下初答，再開啟回饋，最後檢討結果。'], [
        quiz(['Numeric types', '數值型別'], ['What is printed?', '會印出什麼？'], 'double x = 7 / 2;\nSystem.out.print(x);', '3.0', ['3.5', '3', '4.0'], ['Integer division happens before assignment to double.', '整數除法先執行，才指定給 double。']),
        quiz(['String bounds', '字串邊界'], ['What does the expression return?', '這個運算式回傳什麼？'], '"relay".substring(2, 5)', 'lay', ['la', 'ela', 'relay'], ['Indexes 2, 3, and 4 give l, a, y.', '索引 2、3、4 依序是 l、a、y。']),
        quiz(['Short-circuit logic', '短路邏輯'], ['What happens here?', '這段程式的結果為何？'], 'int x = 0;\nboolean ok = x != 0 && 10 / x > 1;', 'ok = false', ['ok = true', 'ArithmeticException', '(compile error)'], ['The left side is false, so Java skips the division on the right.', '左側為 false，所以 Java 略過右側的除法。']),
        quiz(['Loop boundary', '迴圈邊界'], ['What is sum?', 'sum 為何？'], 'int sum = 0;\nfor (int i = 0; i < 4; i++) sum += i;', '6', ['10', '4', '3'], ['The loop adds 0, 1, 2, and 3.', '迴圈加總 0、1、2、3。']),
        quiz(['Object state', '物件狀態'], ['What is printed if Box starts at 0 and inc adds 1?', '若 Box 初始為 0、inc 加 1，會印出什麼？'], 'Box a = new Box();\nBox b = new Box();\na.inc();\nSystem.out.print(b.get());', '0', ['1', '2', '(compile error)'], ['The two constructor calls create separate objects.', '兩次呼叫建構子會建立不同物件。']),
        quiz(['List removal', '清單刪除'], ['After removing index 0, what is list.get(1)?', '刪除索引 0 後，list.get(1) 是什麼？'], 'ArrayList<String> list = new ArrayList<>();\nlist.add("A"); list.add("B"); list.add("C");\nlist.remove(0);', 'C', ['A', 'B', '(index error)'], ['The remaining order is B, C, so C has index 1.', '剩下的順序是 B、C，因此 C 的索引是 1。']),
        quiz(['Grid dimensions', '網格維度'], ['What is grid[0].length?', 'grid[0].length 是多少？'], 'int[][] grid = new int[2][5];', '5', ['2', '7', '10'], ['The grid has two rows, each with five columns.', '網格有兩列，每列有五欄。']),
        quiz(['Recursive base case', '遞迴基底情況'], ['Which input reaches the base case directly?', '哪個輸入會直接進入基底情況？'], 'static int f(int n) {\n    if (n <= 1) return 1;\n    return n * f(n - 1);\n}', '1', ['2', '3', '4'], ['The return is immediate when n <= 1.', 'n <= 1 時直接回傳，不再遞迴。']), mockLab
      ], ['List two concrete mistakes or uncertain concepts. For each, choose an earlier level to replay and write a short practice goal for the next session.', '列出兩個具體錯誤或不熟悉的概念。每個概念選一個前面關卡重練，並寫下下次的短期練習目標。'])
  ];
})();
