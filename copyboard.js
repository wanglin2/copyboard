/*
 * 	CopyBoard.js
 * 	一个简洁的原生复制到剪贴板库
 * 	http://mwlmt.cc/
 * 	2016-11-08
 */

//使用方法
//html
/*
	<textarea name="box" id="box" cols="30" rows="10">王林漫谈-一个有意思的角落</textarea>
	<button id="btn">按钮</button>
*/
//js
/**
 * @param {Object} btn 	需要触发复制的按钮id或类或标签名
 * @param {Object} ele	需要复制内容的元素id或类或标签名
 * @param {Object} fn	复制成功后的回调
 */
//例
/*
  new ClipBoard('#btn','#box',function(msg){
		console.log('复制成功'+msg);
  });
*/

//具体实现
function CopyBoard(btn,ele,fn){
	var t=this;
	//要获取文本的元素(可能不只一个，所以获取结果是一个数组)
	var box=t.query(ele);
	//触发按钮（只取一个）
	var btn=t.query(btn)[0];
	//该事件是基本复制事件，即用户单击相关按钮然后复制规定的元素的内容
	//给按钮绑定单击事件,即复制事件
	t.on(btn,'click',function () {
		if(t.isFunction(fn)){
			//先取得所有文本
			var c=t.getText(box);
			//执行复制事件
			t.copyToBoard(c,fn);
		}else{
			throw new Error('传入的回调不是函数!');
		}
	});
	//该事件是进阶复制事件，即用户鼠标选择规定的元素的内容中的一部分时复制选中的该部分文本
	//给文本框绑定选择事件
	t.getInputsSelectedText(box,function (c) {
		t.copyToBoard(c,fn);
	});
	t.forEachs(box,function(item){
		if(!t.isInputs(item)){
			t.getAllText(item,function(c){
				t.copyToBoard(c,fn);
			});
		}
	});
	
	//初始化人口方法
	this.init();
}
ClipBoard.prototype={
	constructor:ClipBoard,
	//初始化
	init:function(){
		this.createInputBox();
	},
	//创建复制所需的文本框
	createInputBox:function(){
		var inputBox=document.createElement('input');
		inputBox.type="text";
		inputBox.id="copyInputBox";
		inputBox.style.position='absolute';
		inputBox.style.top=-10000+'px';
		document.body.appendChild(inputBox);
	},
	//高亮选择框中的全部内容
	selected:function(ele) {
		var that=this;
		this.forEachs(ele,function(item){
			if(that.isInputs(item)){
				item.select();
			}
		});
	},
	//复制到剪贴板
	copyToBoard:function(str,fn){
		var cBox=this.query('#copyInputBox')[0];
		cBox.value=str;
	    cBox.select(); 
	    document.execCommand("Copy"); 
	    fn(str);
	},
	//获取用户用鼠标选中的文本
	getAllText:function(ele,fn){
		ele.onmouseup = function(){
　　　　　	var selectionObj = null, rangeObj = null, selectedText = "", selectedHtml = "";
　　　　　	if(window.getSelection){
　　　　　　　	selectionObj = window.getSelection();
　　　　　　　	selectedText = selectionObj.toString();
　　　　　　　	rangeObj = selectionObj.getRangeAt(0);
　　　　　　　	var docFragment = rangeObj.cloneContents();
　　　　　　   	var tempDiv = document.createElement("div");
　　　　　　　	tempDiv.appendChild(docFragment);
　　　　　　　	selectedHtml = tempDiv.innerHTML;
　　　　　	}else if(document.selection){
　　　　　　　	selectionObj = document.selection;
　　　　　　　	rangeObj = selectionObj.createRange();
　　　　　　　	selectedText = rangeObj.text;
　　　　　　　	selectedHtml = rangeObj.htmlText;
　　　　　	}
　　　　　	fn(selectedText,selectedHtml);
　　　	};
	},
	//当用户在传入的文本框或文本域中选择文本时返回所选中的那一部分文本
	getInputsSelectedText:function(ele,fn){
		var that=this;
		that.forEachs(ele,function(item){
			that.on(item,'select',function () {
				var c=that.getSelectedText(item);
				fn(c);
			});
		});
	},
	//取得文本框中用户选中的文本
	getSelectedText:function(ele){
		var that=this;
		if(that.isInputs(ele)){
			return ele.value.substring(ele.selectionStart,ele.selectionEnd);
		}
	},
	//获得元素中的全部文本内容(文本框或普通元素都可以)
	getText:function(ele){
		var str='';
		var that=this;
		this.forEachs(ele,function(item){
			if(that.isInputs(item)){
				str+=item.value;
			}else{
				str+=item.innerText;
			}
		});
		return str;
	},
	//循环方法
	forEachs:function(obj,fn){
		var that=this;
		if(!that.isFunction(fn)){
			throw new Error('参数不是函数!');
		}
		if(obj && this.isArray(obj)){
			if(Array.prototype.forEach){
				obj.forEach(function (item) {
					fn(item);
				});
			}else{
				for(var i=0,len=obj.length;i<len;i++){
						fn(obj[i]);
				}
			}
		}else{
			throw new Error('参数不是数组!');
		}
	},
	//是否是输入框，即input type='text'和textarea
	isInputs:function(obj){
		return obj.type=='textarea' || obj.type=='text';
	},
	//是否是字符串
	isString:function(obj) {
	    return typeof obj === 'string'
	        || obj instanceof String;
	},
	//是否是函数
	isFunction:function(obj) {
	    var type = Object.prototype.toString.call(obj);
	    return type === '[object Function]';
	},
	//是否是数组
	isArray:function(obj){
		var type = Object.prototype.toString.call(obj);
		return obj instanceof Array || type==='[object Array]';
	},
	//选择器
	query:function(selector){
		var that=this;
		var reg=/^(#)?(\.)?(\w+)$/img;
		var regResult=reg.exec(selector);
		var result=[];
		//如果是id选择器
		if(regResult[1]){
		  if(regResult[3]){
			if(typeof document.querySelector==="function"){
			  result.push(document.querySelector('#'+regResult[3]));  
			}else{
			  result.push(document.getElementById(regResult[3]));  
			}	
		  }
		}
		//如果是class选择器
		else if(regResult[2]){
		  if(regResult[3]){
			if(typeof document.getElementsByClassName==='function'){
			  	var doms=document.getElementsByClassName(regResult[3]);
				if(doms){
				  result=that.converToArray(doms);	
				}
			}
			//如果不支持 getElementsByClassName
			else{
			  var allDoms=document.getElementsByTagName("*");
			  for(var i=0,len=allDoms.length;i<len;i++){
				if(allDoms[i].className.search(new RegExp(regResult[2]))>-1){
					result.push(allDoms[i]);
				}  
			  }	
			} 
		  }	
		}
		//如果是标签选择器
		else if(regResult[3]){
			var doms=document.getElementsByTagName(regResult[3].toLowerCase());
			if(doms){
				result=that.converToArray(doms);
			}
		}
		return result;
	},
	converToArray:function(nodes){
		var array=null;
		try{
			array=Array.prototype.slice.call(nodes,0);//针对非ie浏览器
		}catch(ex){
		    array=new Array();
			for(var i=0,len=nodes.length;i<len;i++){
				array.push(nodes[i]);
			}	
		}
		return array;
	},
	//跨浏览器的事件绑定方法
	on:function(obj,type,fn){
		//事件处理函数的计数器
		var eventId=1;
		//如果浏览器支持W3C事件标准的话
		if(typeof obj.addEventListener!='undefined'){
			obj.addEventListener(type,fn,false);
		}else{//如果不支持则用原生onclick方式
			//创建事件类型的对象
			if(!obj.events){
				obj.events={}
			}
			//创建存放各种事件类型处理函数的数组
			if(!obj.events[type]){
				obj.events[type]=[];
				//存放第一个事件处理函数
				obj.events[type][0]=fn;
				//执行事件处理
				obj['on'+type]=function(e){
					var e=e || window.event;
					var es=this.events[e.type];
					for(var k in es){
						es[k].call(this,e);
					}
				};
			}else{//检查是否有同名函数，如果有则返回
				var eArr=obj.events[type];
				for(var k in eArr){
					if(eArr[k]==fn){
						return false;
					}
				}
			}
			//给新函数添加存储
			obj.events[type][eventId++]=fn;
		}
	},
	//跨浏览器的事件删除方法
	removeEvent:function(obj,type,fn){
		if(typeof obj.removeEventListener!='undefined'){
			obj.removeEventListener(type,fn,false);
		}else{
			var es=obj.events[type];
			for(var k in es){
				if(es[k]==fn){
					delete obj.events[type][k];
				}
			}
		}
	}
}
