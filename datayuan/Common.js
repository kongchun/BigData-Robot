/**
 * Created by Administrator on 2016/12/21.
 */
var Common = {
    getAbstract:function(arr,$){
        var abstracts = [];
        for(var i = 0;i < arr.length;i++){
            var abstract = $(arr[i]).text();
            abstracts.push(abstract);
        }
        return abstracts;
    },
    getURLNumber:function(url){
        if(url){
            var lIndex = url.lastIndexOf("/");
            var dotIndex = url.lastIndexOf(".");
            return parseInt(url.substring(lIndex+1,dotIndex));
        }
    },
    formatDate:function(str){
        str = str.replace(/-/g,"/");
        return new Date(str);
    },
    checkThumbnail:function(str){
        if(str){
            return "http://www.datayuan.cn"+str;
        }else{
            return "";
        }
    },
    checkTitle:function(container){
        var newTitle = container.find("h2").text();
        var titleStr = container.find("h2").html();
        if(titleStr.length>100){
             var firstIndex = titleStr.indexOf("<div");
             newTitle = titleStr.substr(0,firstIndex);
        }
        return newTitle;
    },
	formatHtml:function(html){
        var newHtml = html.replace(/src="\/u\/cms/g,'src="http://www.datayuan.cn/u/cms');
        var afterHead = this.formatHtmlHead(newHtml);
        var afterFoot = this.formatHtmlFoot(afterHead);
	    return afterFoot;
	},
    //格式化头部来源信息
    formatHtmlHead:function(html){
        var firstIndexP = html.indexOf("<p>");
        var firstIndexEP = html.indexOf("</p>");
        var secondIndex = html.indexOf("<p>",firstIndexP+1);
        var secondIndexEP = html.indexOf("</p>",firstIndexEP+1);
        var secondPcontent = html.substring(secondIndex,secondIndexEP+4);
        if(secondPcontent.indexOf("来源：") > 0){
            html = html.replace(secondPcontent,'');
        }
        return html;
    },
    //格式化尾部来源信息和推荐阅读等信息
    formatHtmlFoot:function(html){
        var lastIndexofP = html.lastIndexOf("<p>");
        var lastIndexofEP = html.lastIndexOf("</p>");
        var lastIndexPcontent = html.substring(lastIndexofP,lastIndexofEP+4);
        var last2IndexofP = html.lastIndexOf("<p>",lastIndexofP-1);
        var last2IndexofEP = html.lastIndexOf("</p>",lastIndexofP - 1);
        var last3IndexofP = html.lastIndexOf("<p>",last2IndexofP - 1);
        var hrIndex = html.lastIndexOf("<hr>");
        //第一种情况：分割线后是广告内容和来源
        if(hrIndex > 0){
            var hrAfterContent = html.substring(hrIndex);
            if(hrAfterContent.indexOf("注：")>0 || hrAfterContent.indexOf("投稿")>0 || hrAfterContent.indexOf("数据猿")>0){
               html = html.replace(hrAfterContent,'');
            }
        }else{
            var last2IndexofPcontent = html.substring(last2IndexofP,last2IndexofEP+4);
            var last3IndexofPcontent = html.substring(last3IndexofP,last2IndexofP);
            //第二种情况:没有分割线,在<p>这里是内容</p><p></p><br><p>来源：xxx</p>

            if(last3IndexofPcontent.indexOf("微信")>0 || last3IndexofPcontent.indexOf("投稿")>0){
                //关键字里有微信、投稿等字样时，过滤
                var temStr = html.substring(last3IndexofP);
                html = html.replace(temStr,'');
            }else{
                //没有过滤字样时继续往上遍历
                //第三种情况：在文章的后三分之一中寻找,如果出现“推荐阅读：”、“关于作者：”等字样,找到往前的第一个父节点p,整体过滤
                var p1Index = html.indexOf("推荐阅读：");
                var p2Index = html.indexOf("关于作者：");
                var p3Index = html.indexOf("注：");
                var p4Index = html.indexOf("延伸阅读");
                if(p1Index > 0 ){
                    var pp1Index = html.lastIndexOf("<p>",p1Index);
                    html = html.replace(html.substring(pp1Index),'');
                }else if(p2Index > 0 ){
                    var pp2Index = html.lastIndexOf("<p>",p2Index);
                    html = html.replace(html.substring(pp2Index));
                }else if(p3Index > 0 ){
                    var pp3Index = html.lastIndexOf("<p>",p3Index);
                    html = html.replace(html.substring(pp3Index));
                }else if(p4Index > 0){
                    var pp4Index = html.lastIndexOf("<p>",p4Index);
                    html = html.replace(html.substring(pp4Index));
                }else{
                    //第四种情况，前三种都不符合时，去掉最后的“来源：”字样
                    if(lastIndexPcontent!=undefined){
                        html =  html.replace(lastIndexPcontent,'');
                    }

                }
            }
        }
        var specialStr1 = "（本文记者春夏&nbsp;微信：1101862984）";
        var specialStr2 = "<strong>大数据</strong></a><strong>24小时&rdquo;，可加作者Abby微信：wmh4178（请注明姓名、公司）交流</strong>";
        if(html.indexOf(specialStr1) > 0){
            html = html.replace(specialStr1,"");
        }
        if(html.indexOf(specialStr2) > 0){
            html = html.replace(html.substring(html.indexOf(specialStr2)),"");
        }
        return html;
    }
	
}
module.exports = Common;