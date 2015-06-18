/*
var datas = [
	[0, 9, 0, 0, 0, 0, 0, 7, 0],
	[0, 3, 8, 4, 1, 0, 5, 0, 0],
	[0, 0, 0, 8, 0, 0, 0, 0, 3],
	[9, 7, 0, 1, 2, 5, 6, 3, 0],
	[0, 0, 6, 0, 8, 9, 1, 0, 0],
	[2, 0, 0, 6, 4, 3, 7, 0, 0],
	[8, 2, 5, 3, 6, 4, 9, 1, 7],
	[0, 4, 3, 0, 5, 0, 2, 0, 0],
	[1, 6, 9, 0, 7, 8, 3, 5, 0]
];
*/
var datas = [
	[6, 0, 9, 5, 0, 0, 0, 0, 0],
	[0, 5, 0, 2, 0, 7, 0, 0, 0],
	[1, 0, 4, 0, 6, 0, 0, 0, 0],
	[0, 4, 0, 0, 0, 0, 0, 1, 2],
	[0, 0, 5, 0, 0, 0, 9, 0, 0],
	[9, 1, 0, 0, 0, 0, 0, 6, 0],
	[0, 0, 0, 0, 4, 0, 5, 0, 6],
	[0, 0, 0, 9, 0, 1, 0, 3, 0],
	[0, 0, 0, 0, 0, 2, 7, 0, 1]
];
/*
var datas = [
	[0, 0, 0, 1, 0, 0, 0, 0, 7],
	[3, 0, 0, 0, 0, 5, 0, 0, 1],
	[0, 0, 0, 3, 0, 0, 9, 8, 0],
	[0, 9, 8, 0, 0, 1, 0, 6, 0],
	[0, 0, 0, 0, 5, 7, 0, 0, 0],
	[6, 0, 0, 0, 9, 0, 7, 0, 3],
	[9, 8, 0, 2, 0, 0, 0, 0, 0],
	[2, 0, 7, 5, 0, 0, 0, 0, 0],
	[0, 5, 0, 0, 4, 0, 0, 9, 0]
];
*/

var inputObj = null;

window.onload = function() {
	var box;
	for (var y = 0; y < 9; y++) {
		for (var x = 0; x < 9; x++) {
			box = document.getElementById("box_" + y + "_" + x);
			box.onclick = toggle;
			box.onblur = toggle;
			box.readonly = true;
			if (datas[y][x] > 0) {
				box.value = datas[y][x];
			}
		}
	}
	return;
};

function toggle() {
	if (this.readOnly) {
		this.readOnly = false;
		this.style.backgroundColor = "#ff9090";
		inputObj = this;
	} else {
		inputObj.value = isNumber(inputObj.value) ? inputObj.value : "";
		this.readOnly = true;
		this.style.backgroundColor = "";
		inputObj = null;
	}
}

function isNumber(n) {
	return (String(n) || "").match(/[0-9]/);
}

/**
 * 解析を行う。やり方は消去法を使うことにする。
 * ■探索方法
 * 1.数字が入力されていないマス目に対し1から9の候補を持たせる。
 * 2.数字が入力されているマス目を１つずつ見て、
 *   入力出来ないことが確定した候補をどんどん削っていく。
 * 3.候補が1つになった時点でそのマスの数字は確定。
 * 4.数字が入力されているマス目の探索をすべて終えた時点で、
 *   行、列、ブロックにおいて１つしか入力できないことが確定した候補は、
 *   その時点で確定。
 * ■終了条件
 * 1.すべての探索を終えて、候補が一つも削れないとき。
 * 2.すべてのマスの数字が確定したとき。
 */
function analyze() {

	var box;

	// 候補情報を初期化する
	var candidate = createCandidate();

	// 確定マスから全体を探索する
	candidate = search(candidate);
	candidate = fixed(candidate, "#008000");
	// 候補を元に絞り込みを行う。
	candidate = narrowDown(candidate);
	candidate = fixed(candidate, "#ff00ff");

	return;

	/** 候補情報を作る */
	function createCandidate() {
		candidate = [];
		for (var y = 0; y < 9; y++) {
			candidate[y] = [];
			for (var x = 0; x < 9; x++) {
				candidate[y][x] = isNumber(document.getElementById("box_" + y + "_" + x)) 
					? [] : [1, 2, 3, 4, 5, 6, 7, 8, 9];
			}
		}
		return candidate;
	}

	/** 探索を行う。 */
	function search(candidate) {
		for (var y = 0; y < 9; y++) {
			for (var x = 0; x < 9; x++) {
				box = document.getElementById("box_" + y + "_" + x);
				if (isNumber(box.value)) {
					candidate = spliceCandidate(candidate, x, y, Number(box.value));
				}
			}
		}
		return candidate;
	}

	/** 指定した番地を中心に候補を削る. */
	function spliceCandidate(candidate, x, y, num) {
		var sy = Math.floor(y / 3) * 3;
		var sx = Math.floor(x / 3) * 3;
		var dy, dx;
		// このマス目に関連する候補を削る。
		for (var i = 0; i < 9; i++) {
			// 列
			var index = candidate[i][x].indexOf(num);
			if (index > -1) {
				candidate[i][x].splice(index, 1);
			}
			// 行
			index = candidate[y][i].indexOf(num);
			if (index > -1) {
				candidate[y][i].splice(index, 1);
			}
			// ブロック
			dy = sy + Math.floor(i / 3);
			dx = sx + (i % 3);
			index = candidate[dy][dx].indexOf(num);
			if (index > -1) {
				candidate[dy][dx].splice(index, 1);
			}
		}
		return candidate;
	}

	/** 候補情報から絞り込みを行う。 */
	function narrowDown(candidate) {

		var num;
		for (var y = 0; y < 9; y++) {
			for (var x = 0; x < 9; x++) {
				if (candidate[y][x].length > 0) {
					for (var i = 0; i < candidate[y][x].length; i++) {
						num = candidate[y][x][i];
						if (checkBox(candidate, x, y, num) == 1
								|| checkRow(candidate, x, y, num) == 1
								|| checkCol(candidate, x, y, num) == 1) {
							candidate[y][x] = [num];
							break;
						}
					}
				}
			}
		}

		return candidate;

		/** 同一行内で指定された数字候補の登場数をカウントする。 */
		function checkRow(_candidate, _x, _y, _num) {
			var count = 0;
			for (var x = 0; x < 9; x++) {
				if (_candidate[_y][x].length > 0
						&& _candidate[_y][x].indexOf(_num) > -1) {
					count++;
				}
			}
			return count;
		}

		/** 同一列内で指定された数字候補の登場数をカウントする。 */
		function checkCol(_candidate, _x, _y, _num) {
			var count = 0;
			for (var y = 0; y < 9; y++) {
				if (_candidate[y][_x].length > 0
						&& _candidate[y][_x].indexOf(_num) > -1) {
					count++;
				}
			}
			return count;
		}
		/** 同一ボックス内で指定された数字候補の登場数をカウントする。 */
		function checkBox(_candidate, _x, _y, _num) {
			var count = 0;
			var sx = Math.floor(_x / 3) * 3;
			var sy = Math.floor(_y / 3) * 3;
			var dx, dy;
			for (var i = 0; i < 9; i++) {
				dx = sx + (i % 3);
				dy = sy + Math.floor(i / 3);
				if (_candidate[dy][dx].length > 0
						&& _candidate[dy][dx].indexOf(_num) > -1) {
					count++;
				}
			}
			return count;
		}
	}

	/** 探索結果を反映させる */
	function fixed(candidate, bgColor) {
		var num;
		for (var y = 0; y < 9; y++) {
			for (var x = 0; x < 9; x++) {
				if (candidate[y][x].length == 1
						&& isNumber(candidate[y][x][0])) {
					box = document.getElementById("box_" + y + "_" + x);
					box.style.backgroundColor = bgColor;
					num = Number(candidate[y][x][0]);
					box.value = num;
					// 反映したら候補情報はクリアしておく
					candidate[y][x] = [];
					// 結果を他のマスの候補情報に反映させておく
					candidate = spliceCandidate(candidate, x, y, num);
				}
			}
		}
		return candidate;
	}
}
