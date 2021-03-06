~function(){
    var canvas=document.createElement("canvas"),buffer=document.createElement("div"),drawing=0,drawQueue=[],
    ex2px=function(){
        var exDom=document.createElement("div");
        exDom.style.cssText="width: 10ex; height: 10ex; position: absolute; left:-10ex; top:-10ex;";
        document.body.appendChild(exDom);
        var offsetW=exDom.offsetWidth;
        return offsetW/10;
    }();
    buffer.style.display="none";
    document.body.appendChild(buffer);
    window.drawLaTex=function(val,callback){
        if(drawing){
            drawQueue.push([val, callback])
            return ;//正在渲染中
        }
        drawing=1;
        buffer.innerHTML=val;
        MathJax.Hub.Queue(
            [
                "Typeset",
                MathJax.Hub,
                buffer
            ],//需要渲染LaTex的容器
            [
                "PreviewDone",//渲染成功回调函数
                {//回调函数的父对象
                    PreviewDone:function()
                    {//渲染成功
                        //console.log("渲染成功");
                        var result = svg2str();
                        drawing=0;//结束渲染
                        callback && typeof callback === 'function' && callback(result);
                        //按队列输出
                        if (drawQueue.length) {
                            //继续渲染
                            var arg = drawQueue.shift();
                            drawLaTex(arg[0], arg[1]);
                        }
                    }
                }
            ]
        );
    };
    var svg2str=function(){
        var MathJax_SVG_glyphs=document.getElementById("MathJax_SVG_glyphs"),
        spriteSVG='<defs>'+MathJax_SVG_glyphs.innerHTML+'</defs>';
        svgs=buffer.querySelectorAll("svg"),
        base64Imgs=[];
        for(var i=0,len=svgs.length;i<len;++i){
            var svg=svgs[i],
            w=parseFloat(svg.getAttribute("width"))*ex2px,
            h=parseFloat(svg.getAttribute("height"))*ex2px,
            display=svg.parentNode.parentNode.className=="MathJax_SVG_Display"?"block":"inline-block";
            svg.setAttribute("width",w+"px");
            svg.setAttribute("height",h+"px");
            svg=svg.outerHTML;
            svg=svg.replace(/(\<svg[^\>]*\>)/,'$1'+spriteSVG);
            canvg(canvas, svg);
            var base64=canvas.toDataURL();//取得base64文件
            base64Imgs.push(base64);
        }
        return base64Imgs;
    };
}();