(function( $ ) {
    $.fn.smartQuestion = function(options) {
        var set = $.extend({
            create : 'question-answer',  
            mode : 'answer',
            submitButton : '.btn-submit',
            onSpellChecker : true,
            adaptive : true,
            event : true,
            obj : undefined,
            count : null, // for hint during answer
            done : function(){ //done load question
            },
            onAnswer : function(){
            },
            onCheck : {
                withoutAnswer : function(){
                },
                withAnswer : function(){
                },
                withErrorSpellChecker : function(){
                }
            },
            onSubmit : function(){
            },
            onView : {
                hint : function(){
                },
                description : function(){
                }
            },
            onStuck : function(){
            },
            onRelatedContent : function(){
            },
            stuckHTML : 'Watch a video or use a hint.',
            relatedHTML : '<div style="font-weight:normal;color: #888D93;margin:16px 0px;" >Not Available</div>',
            hide :""  // "hint, description, mark"

        }, options );
        var obj = set.obj;
        var data = {};
        var cond = set.mode;
        var count = set.count;
        var adaptive = set.adaptive;
        data.abj = ['A','B','C','D','E','F','G'];
        data.hide = set.hide;
        data.stuckHTML = set.stuckHTML;
        data.onSpellChecker = set.onSpellChecker;

        if(obj==undefined){
            console.log('question obj not found.');
            return false;
        }
        var selected = this;

        data.relatedHTML = '<div class="view-col" style="color:#626569;font-weight:bold;width:50%;" >'+
                                '<span>Related content</span>'+
                                '<div class="related-content">'+
                                    set.relatedHTML+
                                '</div>'+
                            '</div>';
        if(set.create==='question-answer'){
            if(obj.answerSelected!=undefined){
                obj.answered = {};
                obj.answered.state = [];
                obj.answered.detail = [];
            }
            data.hintHTML = '<div class="view-row no-line">'+
                                 data.relatedHTML+
                                '<div class="view-col" style="width:50%;color:#626569;font-weight:bold;">'+
                                    '<div style=""> Will Stuck</div>'+
                                    '<button data-count="1" class="btn btn-default btn-gethint">Get a hint</button>'+
                                '</div>'+
                            '</div>';
            createPreview(selected, obj, cond, data);
        }else{
           createPreviewDetail(selected, obj, cond, data, count);
        }
       set.done.call(selected);

       if(set.mode=='answer'){
            if((set.event===true) && (obj.type==='mcq') || (set.event===true) && (obj.type==='benar_palsu')){
                selected.find('.btn-answer').on('click', function(e){
                    var thiS = $(this);
                    var item = {};  
                    item.selected = selected;
                    item.clicker = thiS;
                    if(!thiS.hasClass('view')){
                        if(!thiS.hasClass('selected')){
                            thiS.closest('.answer-group').find('.btn-answer').removeClass('selected');
                            thiS.addClass('selected'); 
                            set.onAnswer.call(item);
                        }
                    }
                });
            }
            if((set.event===true) && (obj.type==='isi_tempat_kosong') || (set.event===true) && (obj.type==='subjective') && (set.onSpellChecker===false)){
                selected.find('.text-answer').on('keyup', function(){
                    var thiS = $(this);
                    var item = {};  
                    item.selected = selected;
                    item.clicker = thiS;
                    if(!thiS.hasClass('view')){
                        var content = thiS.text();
                        if(contentAnalys(content)==false){
                            thiS.removeClass('selected'); 
                        }else{
                            thiS.addClass('selected'); 
                            set.onAnswer.call(item);
                        }
                    }
                });
            }
            if((set.event===true) && (set.onSpellChecker===true) && (obj.type==='subjective')){
                selected.find('.text-answer').autoHeight();
                selected.find('.livespell_textarea').on('keyup', function(){
                    var thiS = $(this);
                    var item = {};  
                    item.selected = selected;
                    item.clicker = thiS;
                    if(!thiS.hasClass('view')){
                        var content = thiS.siblings('.text-answer').val();
                        if(contentAnalys(content)==false){
                            thiS.removeClass('selected').siblings('.text-answer').removeClass('selected'); 
                        }else{
                            thiS.addClass('selected').siblings('.text-answer').addClass('selected'); 
                            set.onAnswer.call(item);
                        }
                    }
                });
            }
            if((set.event===true) && (obj.type==='padanan')){
                selected.find('.select-answer').each(function(){
                    var a = $(this);
                        a.click(function(e){
                            e.preventDefault();
                            var thiS = $(this);
                            var item = {};  
                            item.selected = selected;
                            item.clicker = thiS;
                            if(!thiS.hasClass('view')){
                                var content = thiS.data('type');
                                var id = thiS.data('id');
                                thiS.closest('.tpl-dropdown').addClass('selected').find('.dropdown-parent').html(content)
                                .attr('data-id', id).attr('data-type', content);
                                // var reload = thiS.closest('.tpl-dropdown').html();
                                // thiS.closest('.tpl-dropdown').html(reload);
                                set.onAnswer.call(item);
                            }
                    });

                });
            }
            selected.find('.btn-check').on('click', function(e){
                var thiS = $(this);
                var item = {};
                item.type = thiS.closest('.question-group').data('type');
                item.id = thiS.closest('.question-group').data('id');
                item.index = parseInt(thiS.closest('.question-group').data('index'));
                switch (item.type) {
                    case 'mcq':
                        item.question = $('.question-group[data-id="'+item.id+'"]');
                        item.answerId = item.question.find('.btn-answer.selected').data('id');
                        if(item.answerId==undefined){
                            set.onCheck.withoutAnswer.call(selected);
                            return false;
                        }
                        obj.answerSelected = item.answerId;
                        set.onCheck.withAnswer.call(selected);
                    break;
                    case 'isi_tempat_kosong':    
                        item.question = $('.question-group[data-id="'+item.id+'"]');
                        item.answerId = item.question.find('.text-answer.selected').data('id');
                        if(item.answerId==undefined){
                            set.onCheck.withoutAnswer.call(selected);
                            return false;
                        }
                        item.answerType = [];
                        item.question.find('.answer-group').each(function(){
                            var group = $(this);
                            group.find('.text-answer').each(function(){
                                var textAnswer = $(this);
                                var obj = {};
                                obj.id = textAnswer.data('id');
                                obj.type = textAnswer.text();
                                item.answerType.push(obj);
                            });
                        });
                        obj.answerSelected = item.answerType;
                        //check whether fill all
                        for(var z in item.answerType){
                            console.log('please fill all');
                            if(contentAnalys(item.answerType[z].type)==false){
                                set.onCheck.withoutAnswer.call(selected);
                                return false;
                            }
                        } 
                        set.onCheck.withAnswer.call(selected);                          
                    break;
                    case 'benar_palsu':  
                        item.question = $('.question-group[data-id="'+item.id+'"]');
                        item.answerId = item.question.find('.btn-answer.selected').data('id');
                        if(item.answerId==undefined){
                            set.onCheck.withoutAnswer.call(selected);
                            return false;
                        }
        
                        item.answerType = [];
                        item.question.find('.answer-group').each(function(){
                            var group = $(this);
                            var obj = {};
                            obj.id = group.find('.btn-answer.selected').data('id');
                            obj.type = group.find('.btn-answer.selected').data('type');
                            item.answerType.push(obj);
                        });
                        obj.answerSelected = item.answerType;
                        for(var z in item.answerType){
                            if(item.answerType[z].id==undefined){
                                console.log('please select all');
                                set.onCheck.withoutAnswer.call(selected);
                                return false;
                            }
                        }                           
                        set.onCheck.withAnswer.call(selected);         
                    break;
                    case 'susun_semula':    
                        item.question = $('.question-group[data-id="'+item.id+'"]');
                        item.answerId = item.question.find('.btn-answer.selected').data('id');
                        // if(item.answerId==undefined){
                        //     console.log(question+'no answer selected');
                        //     set.onCheck.withoutAnswer.call(selected);
                        //     return false;
                        // }
                        item.answerType = [];
                        item.question.find('.answer-group .row-reorder.reorder .tpl-sortable').each(function(){
                            var group = $(this);
                            //var arr = [];
                            var obj = {};
                            obj.id = group.data('id');
                            obj.type = [];
                            group.find('li.group').each(function(){
                                obj.type.push($(this).data('id'));
                            });
                            item.answerType.push(obj);
                        });
                        obj.answerSelected = item.answerType;                          
                        set.onCheck.withAnswer.call(selected);
                    break;
                    case 'padanan':   
                        item.question = $('.question-group[data-id="'+item.id+'"]');
                        item.answerId = item.question.find('.tpl-dropdown.selected .dropdown-parent').data('id');
                        if(item.answerId==undefined){
                            set.onCheck.withoutAnswer.call(selected);
                            return false;
                        } 
        
                        item.answerType = [];
                        item.question.find('.answer-group').each(function(){
                            var group = $(this);
                            var obj = {};
                            obj.id = group.find('.tpl-dropdown.selected .dropdown-parent').data('id');
                            obj.type = group.find('.tpl-dropdown.selected .dropdown-parent').data('type');
                            item.answerType.push(obj);
                        });                        
                        obj.answerSelected = item.answerType;
                        for(var z in item.answerType){
                            if(item.answerType[z].id==undefined){
                                console.log('please select all');
                                set.onCheck.withoutAnswer.call(selected);
                                return false;
                            }
                        }                           
                        set.onCheck.withAnswer.call(selected);             
                    break;
                    case 'subjective':    
                        item.question = $('.question-group[data-id="'+item.id+'"]');
                        if(set.onSpellChecker===true){
                            item.answerText = item.question.find('.text-answer.selected').val();
                            if((item.answerText==undefined) || (item.answerText.trim()=='')){
                                set.onCheck.withoutAnswer.call(selected);
                                return false;
                            }
                            item.question.find('.text-answer.selected').spellAsYouType({
                                defaultDictionary:'Bahasa Malaysia,English (International)',
                                checkGrammar:true,
                                ignoreAllCaps: false
                            });

                            // item.spelling = item.question.find('.text-answer.selected').binSpellCheckFields({
                            //     defaultDictionary:'Bahasa Malaysia,English (International)',
                            //     checkGrammar:true
                            // });
                            var count = 0;
                            item.question.find('.text-answer.selected').siblings('.livespell_textarea.selected').find('.livespell_redwiggle').each(function(){
                                count++;
                            });
                            if(count!=0){
                                var o = {};
                                o.container = selected;
                                o.selected = $(this);
                                o.count = count;
                                o.value = item.answerText;
                                set.onCheck.withErrorSpellChecker.call(o); 
                                return false;
                            }
                        }else{
                            item.answerText = item.question.find('.text-answer.selected').html();
                            if((item.answerText==undefined) || (item.answerText.trim()=='')){
                                set.onCheck.withoutAnswer.call(selected);
                                return false;
                            }  
                        }
                        obj.answerSelected = item.answerText
                        set.onCheck.withAnswer.call(selected);                          
                    break;
                    
                } 
            });
            selected.find('.btn-showhint').on('click', function(e){
                var thiS = $(this);
                var item = {};
                item.selected = selected;
                item.clicker = thiS;
                selected.find('.question-hint').show();
                selected.find('.question-action div[data-type="hint"]').hide();
                set.onStuck.call(item);
            });
            selected.find('.btn-gethint').on('click', function(e){
                var thiS = $(this);
                var item = {};  
                item.selected = selected;
                item.clicker = thiS;
                item.count = thiS.data('count'); 
                set.onView.hint.call(item);
                selected.find('.btn-morehint').on('click', function(e){
                    var thiS = $(this);
                    var item = {};  
                    item.selected = selected;
                    item.clicker = thiS;
                    item.count = thiS.data('count'); 
                    set.onView.hint.call(item);
                    selected.find('.btn-morehint').on('click', function(e){
                        var thiS = $(this);
                        var item = {};  
                        item.selected = selected;
                        item.clicker = thiS;
                        item.count = thiS.data('count'); 
                        set.onView.hint.call(item);
                    });
                });
            });
        }else if(set.mode=='view'){
            selected.find('.btn-showdetail[data-type="hint"]').on('click', function(e){
                var thiS = $(this);
                var item = {};
                item.selected = selected;
                item.clicker = thiS;
                if(!thiS.hasClass('show')){
                    thiS.addClass('show');
                    set.onView.hint.call(item);
                    thiS.html(thiS.html().replace('Show', 'Hide'));
                }else{
                    thiS.removeClass('show');
                    thiS.html(thiS.html().replace('Hide', 'Show'));
                    selected.find('.view-group.question-hint').html('').hide();
                }
            });
            selected.find('.btn-showdetail[data-type="description"]').on('click', function(e){
                var thiS = $(this);
                var item = {};
                item.selected = selected;
                item.clicker = thiS;
                if(!thiS.hasClass('show')){
                    thiS.addClass('show');
                    set.onView.description.call(item);
                    thiS.html(thiS.html().replace('Show', 'Hide'));
                }else{
                    thiS.removeClass('show');
                    thiS.html(thiS.html().replace('Hide', 'Show'));
                    selected.find('.view-group.question-description').html('').hide();
                }
            });
        }
        selected.find('.related-content').on('click', function(e){
            var thiS = $(this);
            var item = {};
            item.selected = selected;
            item.clicker = thiS;
            set.onRelatedContent.call(item);
        });

        set.submitButton = $(set.submitButton);
        set.submitButton.on('click', function(e){
            set.onSubmit.call();
        });
        return this;
    };
}( jQuery ));

function createPreview(container, obj, cond, data){
    if(obj.type=='mcq'){
        var html = '<div class="view-group view-mcq">';
        var question = obj.question;
        var answer = obj.answer;

        //creating parent html
        html += getParentHTML(obj);

        //creating question html
        for(var x in question.data){
            var q = question.data[x];
            if(contentAnalys(q.content)!=false){
                html +=   '<div class="view-row no-line">';
                html +=      '<div class="view-col" style="width:100%;">';
                html +=         '<div>'+q.content;
                html +=         '</div>';
                html +=      '</div>';
                html +=   '</div>'; 
            }
            
        }
        if(obj.isParent!=true){
            html += '<div class="view-row no-line padding-o" style="">'+
                        '<div class="view-col" style="width:100%">'+
                            '<div style="color: #aaa;font-weight: bold;">Choose 1 answer:</div>'+
                        '</div>'+
                    '</div>';
        }
        data.count = -1;
         
           html += '<div class="answer-group">';
        for(var y in answer.data){
            var a = answer.data[y];  
            if(contentAnalys(a.content)!=false){          
                data.count++;
                data.isCorrect = '';
                if(cond=='view' || cond=='check'){
                    if(obj.answerSelected!=undefined){
                        if(obj.answerSelected==a.dbId){
                            var state = 0;
                            data.isCorrect = 'wrong';
                            if(a.assign==true){
                                state = 1;
                                data.isCorrect = 'correct';
                            }
                            if(obj.answered!=undefined){
                                obj.answered.state.push(state);
                                obj.answered.detail = obj.answerSelected;
                            }
                            //break;
                            //console.log(obj);
                        }
                    }else{
                        if(a.assign==true){
                            data.isCorrect = 'selected';
                        }
                    }

                }
                
                html +='<div class="view-row">'+
                            '<div class="view-col" style="width:100%">'+
                                '<div data-id="'+a.dbId+'" class="btn-answer tpl-tickgroup '+data.isCorrect+'">'+
                                    '<div class="tick-box">'+
                                        '<div class="tick-no"><span class="no">'+data.abj[data.count]+'</span></div>'+
                                    '</div>'+
                                    '<div class="tick-content item-center"><div>'+a.content+'</div></div>'+
                                '</div>'+
                            '</div> '+  
                        '</div>';
            }

        }    
        html +=     '</div>';
        html += '</div>';
        if(cond!='check'){
            container.html(html);
        }
        
        if(cond=='view'){
            html = '';
            var o = {};
                    o.itemType = 'view-mcq';
                    o.hide = data.hide;
            html += getViewDetailHTML(o);
            container.append(html);
        }
        if(cond=='answer'){
            html = '';
            var o = {};
                    o.itemType = 'view-mcq';
                    o.hide = data.hide;
                    o.hintHTML = data.hintHTML;
                    o.stuckHTML = data.stuckHTML;
            html += getAnswerDetailHTML(o);
            container.append(html);
        }
        return false;
    }
    if(obj.type=='subjective'){
        var html = '<div class="view-group view-subjective">';
        var question =  JSON.parse(JSON.stringify(obj.question));

         //creating parent html
        html += getParentHTML(obj);
    
        for(var x in question.data){
            var q = question.data[x];
            data.count++;
            if(contentAnalys(q.content)==false){
                question.data.splice(x,1);
            }    
        }
    
        //creating question html
        for(var x in question.data){
            var q = question.data[x];
                html +=   '<div class="view-row no-line">';
                html +=      '<div class="view-col" style="width:100%;">';
                html +=         '<div>'+q.content;
                html +=         '</div>';
                html +=      '</div>';
                html +=   '</div>'; 
            
        }

        data.answer = '';
        if((obj.answerSelected!=undefined && cond=='view') || (obj.answerSelected!=undefined && cond=='check')){
            obj.answered.detail = obj.answerSelected;
            obj.answered.state = [1];
            data.answer = obj.answered.detail;
        }
        if(obj.isParent!=true){
            html += '<div class="answer-group">';
            html += '<div class="view-row  no-line">'+
                       '<div class="view-col" style="width:90%">';
                       if(data.onSpellChecker==true){
            html +=        '<textarea class="text-answer answer-text">'+data.answer+'</textarea>';
                       }else{
            html +=        '<div contenteditable="true" class="text-answer answer-text">'+data.answer.replace(/\r?\n/g,'<br/>')+'</div>';
            //html +=        '<textarea class="text-answer answer-text">'+data.answer+'</textarea>';
                       }
            html +=    '</div>'+
                   '</div>';
            html +='</div>';
            if(data.hide.search('mark')<=-1){
                html +='<div class="view-row no-line">'+
                            '<div class="view-col item-right" style="width:100%">'+
                            '[<span class="mark-no">3</span> <span class="mark-desc">markah</span>]'+
                            '</div> '+  
                        '</div>';
            }
                // html += '<div class="view-row no-line padding-o" style="">'+
                //             '<div class="view-col" style="width:100%">'+
                //                 '<div style="color: #aaa;font-weight: bold;">Enter the answer:</div>'+
                //             '</div>'+
                //         '</div>';
    
    
                // html +='<div class="view-row">'+
                //             '<div class="view-col" style="width:100%">'+
                //                '<div class="answer-editor"></div>'+
                //             '</div> '+  
                //         '</div>';
        }
        
        html += '</div>';
        container.html(html);
        if(data.onSpellChecker==true){
            container.find('.text-answer').spellAsYouType({
                defaultDictionary:'Bahasa Malaysia,English (International)',
                checkGrammar:true,
                ignoreAllCaps:false
            });
        }else{
            //container.find('.text-answer').autoHeight();
        }
    
        if(cond=='view'){                  
            html = '';
            var o = {};
            o.itemType = 'view-subjective';
            o.hide = data.hide;
            html += getViewDetailHTML(o);
            container.append(html);
            container.find('.answer-group').find('[contenteditable="true"]').attr('contenteditable', false);
            container.find('.answer-group').find('textarea').attr('disabled', true);
        }

        if(cond=='answer'){
            html = '';
            var o = {};
            o.itemType = 'view-subjective';
            o.hide = data.hide;
            o.hintHTML = data.hintHTML;
            o.stuckHTML = data.stuckHTML;
            html += getAnswerDetailHTML(o);
            container.append(html);
        }
        return false;
    }
    if(obj.type=='susun_semula'){
        var question =  JSON.parse(JSON.stringify(obj.question));
        var answer =  JSON.parse(JSON.stringify(obj.answer));
       
        for(var x in question.data){
            var q = question.data[x];
            data.count++;
            if(contentAnalys(q.content)==false){
                question.data.splice(x,1);
            }    
        }
        for(var x in answer.data){
            var q = answer.data[x];
            data.count++;
            if(contentAnalys(q.content)==false){
                answer.data.splice(x,1);
            }    
        }
    
        //creating question html
        var html = '<div class="view-group view-reorder">';

        //creating parent html
        html += getParentHTML(obj);

        for(var x in question.data){
            var q = question.data[x];
    
            data.hasAnswer = false;
            for(var y in answer.data){
                var a = answer.data[y];
                if(q.id==a.assign){
                    data.answerId = a.dbId;
                    data.hasAnswer = true;
                    data.content = a.content;
                    data.answerKey = a.answerKey;
                    break;
                }
    
            }
    
            if(data.hasAnswer==false){
                html +=   '<div class="view-row no-line">';
                html +=      '<div class="view-col" style="width:100%;">';
                html +=         '<div>'+q.content;
                html +=         '</div>';
                html +=      '</div>';
                html +=   '</div>'; 
            }else{
                //console.log(obj.answer);
                if(answer.type==undefined || answer.type == null){
                    answer.type = 'horizontal';
                }
                html +=   '<div class="view-row padding-0 answer-group">';
                html +=      '<div class="view-col" style="width:50%;">';
                html +=         '<div class="row-reorder no-reorder">';
                html +=            '<ul class="tpl-sortable '+answer.type+'">';
                                        input = q.content;
                                        if(input==null || input==''){
                                            //return false;
                                        }else{
                                            //replaceAll('(?i)<(?!img|/img).*?>', '');
                                            //input = input.replace(/(<([^>]+)>)/ig, "");
                                            input = input.replace(/<\/?(?!img)\w*\b[^>]*>/ig, '');
                                        }                               
                                        var arr = input.split(/\s+(?=[^\])}]*([\[({]|$))/);
                                        for(var x in arr){
                                            if(arr[x].indexOf('[')!=-1){
                                                arr[x] = arr[x].replace(/&nbsp;|<br>/g,"");
                                                //var clean = arr[x].replace(/[^a-z0-9\s]/gi, '').replace(/[_\s]/g, ' ');
                                                var clean = arr[x].replace(/\[/g,"").replace(/\]/g,"");
                                                if(arr[x]=='['+clean+']'){
                html+=                             '<li><div class="hide value">'+clean+'</div>'+clean+'</li> ';            
                                                }
                                            }
                                        }
                html +=             '</ul>';
                html +=         '</div>';
                html +=      '</div>';
                html +=      '<div class="view-col wrapper-reorder" style="width:50%;">';
                                 data.isCorrect = '';
                                 if((cond=='view' && obj.answerSelected!=undefined) || (cond=='check' && obj.answerSelected!=undefined)){
                                    var state = 0;
                                    for(var a in obj.answerSelected){
                                        if(obj.answerSelected[a].id==data.answerId){
                                            for(var b in obj.answerSelected[a].type){
                                                if(obj.answerSelected[a].type.toString()==data.answerKey.toString()){
                                                    data.isCorrect = 'correct';
                                                    state = 1;
                                                }else{
                                                    data.isCorrect = 'wrong';
                                                    state = 0;
                                                }
                                                if(obj.answered!=undefined){
                                                    obj.answered.state.push(state);
                                                    obj.answered.detail = obj.answerSelected;
                                                }
                                            }
                                            break;
                                        }
                                    } 
                                }
                html +=         '<div class="row-reorder reorder '+data.isCorrect+'">';
                html +=            '<ul data-id="'+data.answerId+'" class="tpl-sortable '+answer.type+'">';
                                        input = data.content;
                                        if(input==null || input==''){
                                            //return false;
                                        }else{
                                            //replaceAll('(?i)<(?!img|/img).*?>', '');
                                            //input = input.replace(/(<([^>]+)>)/ig, "");
                                            input = input.replace(/<\/?(?!img)\w*\b[^>]*>/ig, '');
                                        }                               
                                        var arr = input.split(/\s+(?=[^\])}]*([\[({]|$))/);
                                        var count = -1;
                                        if(cond=='view' && obj.answerSelected!=undefined){
                                            for(var a in obj.answerSelected){
                                                //console.log(obj.answerSelected[a].id+' '+data.answerId);
                                                if(obj.answerSelected[a].id==data.answerId){
                                                    for(var b in obj.answerSelected[a].type){
                                                        var x = parseInt(obj.answerSelected[a].type[b]);
                                                        count++;
                                                        if(arr[x].indexOf('[')!=-1){
                                                            arr[x] = arr[x].replace(/&nbsp;|<br>/g,"");
                                                            //var clean = arr[x].replace(/[^a-z0-9\s]/gi, '').replace(/[_\s]/g, ' ');
                                                            var clean = arr[x].replace(/\[/g,"").replace(/\]/g,"");
                                                            if(arr[x]=='['+clean+']'){
                                                                
                 html+=                            '<li class="group" data-id="'+count+'" ><div class="hide value">'+clean+'</div>'+clean+'</li> ';            
                                                            }
                                                        }

                                                    }
                                                    break;
                                                }
                                            }

                                        }else{
                                            for(var x in arr){
                                                count++;
                                                if(arr[x].indexOf('[')!=-1){
                                                    arr[x] = arr[x].replace(/&nbsp;|<br>/g,"");
                                                    //var clean = arr[x].replace(/[^a-z0-9\s]/gi, '').replace(/[_\s]/g, ' ');
                                                    var clean = arr[x].replace(/\[/g,"").replace(/\]/g,"");
                                                    if(arr[x]=='['+clean+']'){
                html+=                            '<li class="group" data-id="'+count+'" ><div class="hide value">'+clean+'</div>'+clean+'</li> ';            
                                                    }
                                                }
                                            }
                                        }
                html +=             '</ul>';
                html +=         '</div>';
                html +=      '</div>';
                html +=   '</div>'; 
    
            }
       
    
        
    
     
           
        }
        html += '</div>';
        if(cond!='check'){
           container.html(html);
        }
        if(cond=='view'){
            html = '';
            var o = {};
            o.itemType = 'view-reorder';
            o.hide = data.hide;
            html += getViewDetailHTML(o);
            container.append(html);
        }
        if(cond=='answer'){
            html = '';
            var o = {};
            o.itemType = 'view-reorder';
            o.hide = data.hide;
            o.hintHTML = data.hintHTML;
            o.stuckHTML = data.stuckHTML;
            html += getAnswerDetailHTML(o);
            container.append(html);
        }
        return false;
    }
    if(obj.type=='isi_tempat_kosong'){
        var question =  JSON.parse(JSON.stringify(obj.question));
        var answer =  JSON.parse(JSON.stringify(obj.answer));
    
        for(var x in question.data){
            var q = question.data[x];
            data.count++;
            if(contentAnalys(q.content)==false){
                question.data.splice(x,1);
            }    
        }
        for(var x in answer.data){
            var q = answer.data[x];
            data.count++;
            if(contentAnalys(q.content)==false){
                answer.data.splice(x,1);
            }    
        }
        var html = '<div class="view-group view-fillinblank">';
    
        //creating question html
        //creating parent html
        html += getParentHTML(obj);

        for(var x in question.data){
            var q = question.data[x];
    
            data.hasAnswer = false; 
            for(var y in answer.data){
                var a = answer.data[y];
                if(a.assign!=undefined){
                    if(a.assign!=null){
                        if(a.assign.toString().indexOf(q.id)>-1){
                            data.hasAnswer = true; 
                            break;
                        }
                    }
                }
            }
            if(data.hasAnswer == false){
                html +=   '<div class="view-row">';
                html +=      '<div class="view-col" style="width:100%;display:flex;align-items:center;line-height: 2.5;">';
                html +=        '<div>';
                html +=             q.content;               
                html +=        '</div>';
                html +=      '</div>';
                html +=   '</div>';
            }
            if(data.hasAnswer == true){
    
                html +=   '<div class="view-row">';
                html +=      '<div class="view-col answer-group" style="width:100%;display:flex;align-items:center;line-height: 2.5;">';
                html +=        '<div>';
    
                    var input = q.content;
                    if(input==null || input==''){
                        return false;
                    }else{
                        input = input.replace(/<\/?(?!img)\w*\b[^>]*>/ig, '');
                    }
                    var arr = input.split(/\s+(?=[^\])}]*([\[({]|$))/);
    
                    for(var x in arr){
                        if(arr[x].indexOf('[')!=-1){
                            arr[x] = arr[x].replace(/&nbsp;|<br>/g,"");
                            var clean = arr[x].replace(/\[/g,"").replace(/\]/g,"");
                        
                            if(arr[x]=='['+clean+']'){
                                data.answerId = null;
                                data.content = '';
                                data.isCorrect = '';
                                for(var y in answer.data){
                                    var a = answer.data[y];
                                    if(a.assign!=undefined){
                                        if(a.assign!=null){
                                            if(a.assign.toString().indexOf(q.id)>-1){
                                                if(a.assign.toString()==q.id+' '+clean){
                                                    if(cond=='view' || cond=='check'){
                                                        if(obj.answerSelected!=undefined){
                                                            var state = 0;
                                                            for(var z in obj.answerSelected){
                                                                if(obj.answerSelected[z].id==a.dbId){
                                                                    data.content = obj.answerSelected[z].type;
                                                                    //console.log(a.content+' '+data.content);
                                                                    if(a.content.toLowerCase().trim()==data.content.toLowerCase().trim()){
                                                                        state = 1;
                                                                        data.isCorrect = 'correct';
                                                                    }else if(getPossibleAns(a.answerList, data.content.toLowerCase().trim())==true){
                                                                        data.isCorrect = 'correct';
                                                                        state = 1;
                                                                    }else{
                                                                        data.isCorrect = 'wrong';
                                                                        state = 0;
                                                                    }
                                                                    if(obj.answered!=undefined){
                                                                        obj.answered.state.push(state);
                                                                        obj.answered.detail = obj.answerSelected;
                                                                    }
                                                                }
                                                            }
                                                        }else{
                                                            data.content = a.content;
                                                            data.isCorrect = 'selected';
                                                        }
                                                    }else{
                                                        data.answerId = a.dbId;
                                                    }
                
                                                    
                                                }
                                            }
                                        }
                                    }
                                }
                                
                            
                                if(answer.type=='select'){
                html +=             '<div class="tpl-dropdown bottom-line">'+
                                        '<div class="dropdown-child">'+
                                            '<ul>'+
                                            '<div style="color: #90949c;text-align: center;width: 200px;padding: 10px 15px;" class="content-sub">No answer available</div>'+
                                            '</ul>'+
                                        '</div>'+
                                        '<div class="dropdown-parent">Choose</div>'+
                                '</div>';
                                }
                                if(answer.type=='fill' || answer.type==undefined || answer.type==null){
                html +=             '<div data-id="'+data.answerId+'" contenteditable="true" class="tpl-input tpl-fill text-answer '+data.isCorrect+'">'+data.content+'</div>';
                                }
                                    
                            }
                        }else{
                html +=           ' '+arr[x]+' ';
                        }
                    }
                html +=          '</div>';
                html +=        '</div>';
                html +=     '</div>';
            }
           
        }
        html += '</div>';
        if(cond!='check'){
            container.html(html);
        }
    
        if(cond=='view'){

            html = '';
            var o = {};
            o.itemType = 'view-fillinblank';
            o.hide = data.hide;
            html += getViewDetailHTML(o);
            container.append(html);
        }

        if(cond=='answer'){
            var o = {};
            o.itemType = 'view-fillinblank';
            o.hide = data.hide;
            o.hintHTML = data.hintHTML;
            o.stuckHTML = data.stuckHTML;
            html += getAnswerDetailHTML(o);
        }
    
        html = '';
        //creating answer html
        if(answer.type=='select'){
            for(var x in answer.data){
                var a = answer.data[x];
                html += '<a href="#"><li>'+a.content+'</li></a>';
            }
            container.find('.tpl-dropdown ul').html(html);
        }
        return false;
    }
    if(obj.type=='padanan'){
        var question =  JSON.parse(JSON.stringify(obj.question));
        var answer =  JSON.parse(JSON.stringify(obj.answer));
        
        for(var x in question.data){
            var q = question.data[x];
            data.count++;
            if(contentAnalys(q.content)==false){
                question.data.splice(x,1);
            }    
        }
        for(var x in answer.data){
            var q = answer.data[x];
            data.count++;
            if(contentAnalys(q.content.left)==false){
                answer.data.splice(x,1);
            }    
        }
        for(var x in answer.data){
            var q = answer.data[x];
            data.count++;
            if(contentAnalys(q.content.right)==false){
                answer.data.splice(x,1);
            }    
        }
        var html = '<div class="view-group view-matching">';

        //creating parent html
        html += getParentHTML(obj);

        //creating question html
        for(var x in question.data){
            var q = question.data[x];
            html +=   '<div class="view-row">';
            html +=       '<div class="view-col" style="width:100%;">';
            html +=           '<div>'+q.content;
            html +=           '</div>';
            html +=      '</div>';
            html +=   '</div>'; 
        }
        var count = -1;
        for(var x in answer.data){
            count++;
            var a = answer.data[x];
            html +=   '<div class="view-row answer-group">';
            html +=      '<div class="view-col" style="width:50%;">';
            html +=         '<div>'+a.content.left;
            html +=         '</div>';
            html +=      '</div>';
            html +=        '<div class="view-col" style="width:50%">';
                                data.content = 'Choose';
                                data.isCorrect = '';
                                if(cond=='view' || cond=='check'){
                                    data.isCorrect = 'selected';
                                    data.content = a.content.right;
                                    if(obj.answerSelected!=undefined){   
                                            var state = 0;
                                            if(obj.answerSelected[count].id==a.dbId){
                                                data.isCorrect = 'correct';
                                                data.content = a.content.right;
                                                state = 1;
                                                
                                            }else{
                                                data.isCorrect = 'wrong';
                                                data.content = obj.answerSelected[count].type;
                                                state = 0;
                                            }
                                            if(obj.answered!=undefined){
                                                obj.answered.state.push(state);
                                                obj.answered.detail = obj.answerSelected;
                                            }
                                    }

                                }    
            html +=             '<div class="'+data.isCorrect+' tpl-dropdown">'+
                                    '<div class="dropdown-child">'+
                                        '<ul>'+
                                            '<div style="color: #90949c;text-align: center;width: 200px;padding: 10px 15px;" class="content-sub">No answer available</div>'+
                                        '</ul>'+
                                    '</div>';                                
            html +=                 '<div class="dropdown-parent">'+data.content+'</div>';
            html +=             '</div>';
            html +=        '</div>';
            html +=   '</div>';        
        }
        html += '</div>';
        if(cond!='check'){
           container.html(html);
        }
        if(cond=='view'){
            html = '';
            var o = {};
            o.itemType = 'view-matching';
            o.hide = data.hide;
            html += getViewDetailHTML(o);
            container.append(html);
        }

        if(cond=='answer'){
            var o = {};
            o.itemType = 'view-matching';
            o.hide = data.hide;
            o.hintHTML = data.hintHTML;
            o.stuckHTML = data.stuckHTML;
            html += getAnswerDetailHTML(o);
        }
    
        html = '';
        //creating answer html
        if(cond!='check'){
            if(answer.type==null){
                for(var x in answer.data){
                    var a = answer.data[x];
                    html += '<a class="select-answer" data-id="'+a.dbId+'" data-type="'+a.content.right+'" href=""><li>'+a.content.right+'</li></a>';
                }
                container.find('.tpl-dropdown ul').html(html);
            }
        }
        return false;
    }
    if(obj.type=='benar_palsu'){
        var question =  JSON.parse(JSON.stringify(obj.question));
        var answer =  JSON.parse(JSON.stringify(obj.answer));
    
        for(var x in question.data){
            var q = question.data[x];
            data.count++;
            if(contentAnalys(q.content)==false){
                question.data.splice(x,1);
            }    
        }
        for(var x in answer.data){
            var q = answer.data[x];
            data.count++;
            if(contentAnalys(q.content)==false){
                answer.data.splice(x,1);
            }    
        }
        var html = '<div class="view-group view-truefalse">';

        //creating parent html
        html += getParentHTML(obj);
   
        //creating question html
        for(var x in question.data){
            var q = question.data[x];
    
            data.hasAnswer = false;
            for(var y in answer.data){
                var a = answer.data[y];
                if(q.id==a.assign){
                    data.hasAnswer = true;
                    data.answerId = null;
                    if(cond=='view' || cond=='check'){
                        if(obj.answerSelected!=undefined){
                            for(var z in obj.answerSelected){
                                if(obj.answerSelected[z].id==a.dbId){
                                    data.content = JSON.parse(obj.answerSelected[z].type);
                                }
                            }
                            data.dbContent = JSON.parse(a.content.toLowerCase());
                        }else{
                            data.content = JSON.parse(a.content.toLowerCase());
                        }
                    }else{
                        data.answerId = a.dbId;
                    }
                    break;
                }
            }
    
            if(data.hasAnswer==false){
                html +=   '<div class="view-row no-line">';
                html +=      '<div class="view-col" style="width:100%;">';
                html +=         '<div>'+q.content;
                html +=         '</div>';
                html +=      '</div>';
                html +=   '</div>'; 
            }else{
                html +=   '<div class="view-row">';
                html +=      '<div class="view-col" style="width:50%;">';
                html +=         '<div>'+q.content;
                html +=         '</div>';
                html +=      '</div>';
                html +=      '<div class="view-col answer-group" style="width:50%;">';
                                if(answer.type=='select')  {
                html +=            '<div class="tpl-dropdown ">'+
                                        '<div class="dropdown-child">'+
                                            '<ul>'+
                                                '<a href="#"><li>True</li></a>'+
                                                '<a href="#"><li>False</li></a>'+
                                            '</ul>'+
                                        '</div>'+
                                        '<div class="dropdown-parent">'+data.content+'</div>'+
                                    '</div>';
                                }
                                if(answer.type=='multiple' || answer.type==undefined || answer.type==null)  {
                                    data.isCorrect = '';
                                    if(data.content==true){
                                        data.isCorrect = 'selected';
                                    }
                                    if(obj.answerSelected!=undefined){
                                        var state = null;
                                        if(data.content==true){
                                            data.isCorrect='wrong';
                                            state = 0;
                                        }
                                        if(data.dbContent==true && data.content==true){
                                            data.isCorrect = 'correct';
                                            state = 1;
                                        }
                                        if(state!=null){
                                            if(obj.answered!=undefined){
                                                obj.answered.state.push(state);
                                                obj.answered.detail = obj.answerSelected;
                                            }
                                        }
                                    }
                html +=             '<div data-id="'+data.answerId+'" data-type="true" class="tpl-tickgroup btn-answer '+data.isCorrect+'">'+
                                        '<div class="tick-box">'+
                                            '<div class="tick-no"><span class="no">T</span></div>'+
                                        '</div>'+
                                        '<div class="tick-content">True</div>'+
                                    '</div>';
                                    data.isCorrect = '';
                                    if(data.content==false){
                                        data.isCorrect = 'selected';
                                    }
                                    var state  = null
                                    if(obj.answerSelected!=undefined){
                                        if(data.content==false){
                                            data.isCorrect='wrong';
                                            state = 0;
                                        }
                                        if(data.dbContent==false && data.content==false){
                                            data.isCorrect = 'correct';
                                            state = 1;
                                        }
                                        if(state!=null){
                                            if(obj.answered!=undefined){
                                                obj.answered.state.push(state);
                                                obj.answered.detail = obj.answerSelected;
                                            }
                                        }
                                    }
                html +=             '<div data-id="'+data.answerId+'" data-type="false" class="tpl-tickgroup btn-answer '+data.isCorrect+'">'+
                                        '<div class="tick-box">'+
                                            '<div class="tick-no"><span class="no">F</span></div>'+
                                        '</div>'+
                                        '<div class="tick-content">False</div>'+
                                   '</div>';
                                }
                html +=      '</div>';
                html +=   '</div>'; 
    
            }
        }
        html += '</div>';
        if(cond!='check'){
            container.html(html);
        }
        if(cond=='view'){
            html = '';
            var o = {};
            o.itemType = 'view-truefalse';
            o.hide = data.hide;
            html += getViewDetailHTML(o);
            container.append(html);

        }
        if(cond=='answer'){
            var o = {};
            o.itemType = 'view-truefalse';
            o.hide = data.hide;
            o.hintHTML = data.hintHTML;
            o.stuckHTML = data.stuckHTML;
            html += getAnswerDetailHTML(o);
        }
        return false;
    }
    if(obj.type=='pengelasan'){
        var question =  JSON.parse(JSON.stringify(obj.question));
        var answer =  JSON.parse(JSON.stringify(obj.answer));
    
        for(var x in question.data){
            var q = question.data[x];
            data.count++;
            if(contentAnalys(q.content)==false){
                question.data.splice(x,1);
            }    
        }
        for(var x in answer.data){
            var q = answer.data[x];
            data.count++;
            if(contentAnalys(q.content)==false){
                answer.data.splice(x,1);
            }    
        }
        var html = '<div class="view-group">';
    
        //creating parent html
        html += getParentHTML(obj);

        //creating question html
        for(var x in question.data){
            var q = question.data[x];
    
            data.hasAnswer = false; 
            for(var y in answer.data){
                var a = answer.data[y];
                if(a.assign!=undefined){
                    if(a.assign!=null){
                        if(a.assign.toString().indexOf(q.id)>-1){
                            data.hasAnswer = true; 
                            break;
                        }
                    }
                }
            }
            if(data.hasAnswer == false){
                html +=   '<div class="view-row">';
                html +=      '<div class="view-col" style="width:100%;display:flex;align-items:center;line-height: 2.5;">';
                html +=        '<div>';
                html +=             q.content;               
                html +=        '</div>';
                html +=      '</div>';
                html +=   '</div>';
            }
            if(data.hasAnswer == true){
    
                html +=   '<div class="view-row">';
                html +=      '<div class="view-col" style="width:100%;display:flex;align-items:center;line-height: 2.5;">';
                html +=        '<div>';
    
                    var input = q.content;
                    if(input==null || input==''){
                        return false;
                    }else{
                        input = input.replace(/<\/?(?!img)\w*\b[^>]*>/ig, '');
                    }
                    var arr = input.split(/\s+(?=[^\])}]*([\[({]|$))/);
    
                    for(var x in arr){
                        if(arr[x].indexOf('[')!=-1){
                            arr[x] = arr[x].replace(/&nbsp;|<br>/g,"");
                            var clean = arr[x].replace(/\[/g,"").replace(/\]/g,"");
                        
                            if(arr[x]=='['+clean+']'){
                            
                                if(answer.type=='select' || answer.type==undefined || answer.type==null){
                html +=             '<div class="tpl-dropdown bottom-line">'+
                                        '<div class="dropdown-child">'+
                                            '<ul>'+
                                            '<div style="color: #90949c;text-align: center;width: 200px;padding: 10px 15px;" class="content-sub">No answer available</div>'+
                                            '</ul>'+
                                        '</div>'+
                                        '<div class="dropdown-parent">Choose</div>'+
                                '</div>';
                                }
                                if(answer.type=='fill'){
                html +=             '<div  contenteditable="true" class="tpl-input tpl-fill"></div>';
                                }
                                    
                            }
                        }else{
                html +=           ' '+arr[x]+' ';
                        }
                    }
                html +=          '</div>';
                html +=        '</div>';
                html +=     '</div>';
            }
           
        }
        html += '</div>';
        container.html(html);
    
        if(cond=='view'){
            html = '';
            var o = {};
            o.itemType = 'view-pengelasan';
            o.hide = data.hide;
            html += getViewDetailHTML(o);
            container.append(html);
        }

        if(cond=='answer'){
            var o = {};
            o.itemType = 'view-pengelasan';
            o.hide = data.hide;
            o.hintHTML = data.hintHTML;
            o.stuckHTML = data.stuckHTML;
            html += getAnswerDetailHTML(o);
        }
    
        html = '';
        //creating answer html
        if(answer.type=='select'  || answer.type==undefined || answer.type==null){
            for(var x in answer.data){
                var a = answer.data[x];
                html += '<a class="select-answer" data-id="'+a.id+'" data-type="'+a.content+'" href=""><li>'+a.content+'</li></a>';
            }
            container.find('.tpl-dropdown ul').html(html);
        }
        return false;
    }
    // if(obj.type=='parent'){
    //     var html = '<div class="view-group view-parent">';
    //     var question = obj.question;
    //     var answer = obj.answer;
    
    //     //creating question html
    //     for(var x in question.data){
    //         var q = question.data[x];
    //             html +=   '<div class="view-row no-line">';
    //             html +=      '<div class="view-col" style="width:100%;">';
    //             html +=         '<div>'+q.content;
    //             html +=         '</div>';
    //             html +=      '</div>';
    //             html +=   '</div>'; 
            
    //     }   
    //     html += '</div>';
    //     container.html(html);
    //     return false;
    // }

}

function createPreviewDetail(container, obj, cond, data, count){
    if(obj.type=='mcq'){
        var hint =  JSON.parse(JSON.stringify(obj.hint));
        var answer = JSON.parse(JSON.stringify(obj.answer));
        
        for(var x in hint.data){
            var q = hint.data[x];
            data.count++;
            if(contentAnalys(q.content)==false){
                hint.data.splice(x,1);
            }    
        }

        for(var x in answer.data){
            var q = answer.data[x];
            data.count++;
            if(contentAnalys(q.content)==false){
                answer.data.splice(x,1);
            }    
        }

        var html = '';

        if(cond=='hint'){
            data.count = 0;
            for(var x in hint.data){
                var q = hint.data[x];
                data.count++;
                //console.log(data.count+' '+count);
                if(data.count<=count){
                    html +=   '<div class="view-row no-line">';
                    html +=      '<div class="view-col border-right col-seq">';
                    html +=         '<div>'+
                                        data.count+' / '+hint.data.length;
                    html +=         '</div>';
                    html +=      '</div>'+
                                    '<div class="view-col" style="width:85%">'+
                                        '<div>'+q.content+'</div>'+
                                    '</div>';
                    html +=   '</div>'; 
                    if(data.count==count){
                        break;
                    }
                }
            }
            var another = data.count + 1;
            html += '<div class="view-row text-bold no-line">'+
                        '<div class="view-col"  style="width:100%;text-align:left;">';
                        if(count < hint.data.length){
            html +=        '<div data-count="'+another+'" class="btn-more btn-morehint">'+
                                '<i class="fa fa-plus"></i> Get another hint ('+data.count+'/'+hint.data.length+')'+
                            '</div>';
                        }else{
            html +=     '<div class="btn-more">'+
                            'Hint ('+data.count+'/'+hint.data.length+')'+
                        '</div>';
                        }
            html +=     '</div>'+
                    '</div>';

        }
        if(cond=='description'){    
            data.count = -1;
            for(var y in answer.data){
                var a = answer.data[y];  
                data.count++;  
                data.isCorrect = '';
                if(a.assign==true){
                    data.isCorrect = 'correct';
                }       
                html +='<div class="view-row" style="flex-wrap: wrap;">'+
                            '<div class="view-col" style="width:100%">'+
                                '<div class="tpl-tickgroup '+data.isCorrect+'">'+
                                    '<div class="tick-box">'+
                                        '<div class="tick-no"><span class="no">'+data.abj[data.count]+'</span></div>'+
                                    '</div>'+
                                    '<div class="tick-content item-center"><div style="">'+a.content+'</div>'+
                                    '</div>'+
                                '</div>'+
                            '</div> ';
                        data.count2 = 0;
                        if(a.descriptionList!=undefined){
                            if(a.descriptionList!=null){
                html +=     '<div class="view-col" style="width:100%">';
                                for(var x in a.descriptionList){
                                    var d = a.descriptionList[x];
                                    data.count2++;
                                    if(contentAnalys(d.content)!=false){
                                        html +=   '<div class="view-row no-line" style="padding-top: 0px;">';
                                        html +=      '<div class="view-col border-right col-seq">';
                                        html +=         '<div>'+
                                                            data.count2+' / '+a.descriptionList.length;
                                        html +=         '</div>';
                                        html +=      '</div>'+
                                                    '<div class="view-col" style="width:85%">'+
                                                        '<div>'+d.content+'</div>'+
                                                    '</div>';
                                        html +=   '</div>'; 
                                    }    
                                }
                                html += '<div class="view-row text-bold no-line">'+
                                            '<div class="view-col"  style="width:100%;text-align:left;">'+
                                                '<div class="btn-more">'+
                                                    'Answer Description ('+a.descriptionList.length+'/'+a.descriptionList.length+')'+
                                                '</div>'+
                                            '</div>'+
                                        '</div>';
                html +=     '</div>';
                            }
                        }else{
                html +=     '<div class="view-col" style="width:100%">';
                            html += '<div class="view-row text-bold no-line">'+
                                        '<div class="view-col"  style="width:100%;text-align:left;">'+
                                            '<div class="btn-more">'+
                                                'Answer Description (0/0)'+
                                            '</div>'+
                                        '</div>'+
                                    '</div>';
                html +=    '</div>';
                        }
                            
                html += '</div>';
                

            }    
        }
        container.html(html).show();
        if(cond=='hint'){
            container.append('<div class="view-row" style="flex-wrap: wrap;border-top:1px solid #D6D8DA;padding-top:20px;margin-top:20px;">'+data.relatedHTML+'</div>');
        }
        return false;
    }
    if(obj.type=='subjective'){
        var hint =  JSON.parse(JSON.stringify(obj.hint));
        var answer = JSON.parse(JSON.stringify(obj.scheme));
    
        for(var x in hint.data){
            var q = hint.data[x];
            data.count++;
            if(contentAnalys(q.content)==false){
                hint.data.splice(x,1);
            }    
        }
    
        for(var x in answer.data){
            var q = answer.data[x];
            data.count++;
            if(contentAnalys(q.content)==false){
                answer.data.splice(x,1);
            }    
        }
    
        var html = '';
    
        if(cond=='hint'){
            data.count = 0;
            for(var x in hint.data){
                var q = hint.data[x];
                data.count++;
                //console.log(data.count+' '+count);
                if(data.count<=count){
                    html +=   '<div class="view-row no-line">';
                    html +=      '<div class="view-col border-right col-seq">';
                    html +=         '<div>'+
                                        data.count+' / '+hint.data.length;
                    html +=         '</div>';
                    html +=      '</div>'+
                                    '<div class="view-col" style="width:85%">'+
                                        '<div>'+q.content+'</div>'+
                                    '</div>';
                    html +=   '</div>'; 
                    if(data.count==count){
                        break;
                    }
                }
            }
            var another = data.count + 1;
            html += '<div class="view-row text-bold no-line">'+
                        '<div class="view-col"  style="width:100%;text-align:left;">';
                        if(count < hint.data.length){
            html +=        '<div data-count="'+another+'" class="btn-more btn-morehint">'+
                                '<i class="fa fa-plus"></i> Get another hint ('+data.count+'/'+hint.data.length+')'+
                            '</div>';
                        }else{
            html +=     '<div class="btn-more">'+
                            'Hint ('+data.count+'/'+hint.data.length+')'+
                        '</div>';
                        }
            html +=     '</div>'+
                    '</div>';
    
        }
        if(cond=='description'){    
            data.count = 0;
            for(var y in answer.data){
                var a = answer.data[y];  
                data.count++;         
                html +='<div class="view-row" style="flex-wrap: wrap;">'+
                            '<div class="view-col" style="width:100%">'+
                                '<div class="tpl-tickgroup">'+
                                    '<div class="tick-box">'+
                                        '<div class="tick-no"><span class="no">'+data.count+'</span></div>'+
                                    '</div>'+
                                    '<div class="tick-content item-center"><div style="">'+a.content+'</div>'+
                                    '</div>'+
                                '</div>'+
                            '</div> ';
                        data.count2 = 0;
                        if(a.descriptionList!=undefined){
                            if(a.descriptionList!=null){
                html +=     '<div class="view-col">';
                                for(var x in a.descriptionList){
                                    var d = a.descriptionList[x];
                                    data.count2++;
                                    if(contentAnalys(d.content)!=false){
                                        html +=   '<div class="view-row no-line" style="padding-top: 0px;">';
                                        html +=      '<div class="view-col border-right col-seq">';
                                        html +=         '<div>'+
                                                            data.count2+' / '+a.descriptionList.length;
                                        html +=         '</div>';
                                        html +=      '</div>'+
                                                    '<div class="view-col" style="width:85%">'+
                                                        '<div>'+d.content+'</div>'+
                                                    '</div>';
                                        html +=   '</div>'; 
                                    }    
                                }
                                html += '<div class="view-row text-bold no-line">'+
                                            '<div class="view-col"  style="width:100%;text-align:left;">'+
                                                '<div class="btn-more">'+
                                                    'Answer Scheme Description ('+a.descriptionList.length+'/'+a.descriptionList.length+')'+
                                                '</div>'+
                                            '</div>'+
                                        '</div>';
                html +=     '</div>';
                            }
                        }else{
                html +=     '<div class="view-col">';
                                html += '<div class="view-row text-bold no-line">'+
                                    '<div class="view-col"  style="width:100%;text-align:left;">'+
                                        '<div class="btn-more">'+
                                            'Answer Scheme Description (0/0)'+
                                        '</div>'+
                                    '</div>'+
                                '</div>';
                html +=     '</div>';
                        }
                            
                
                html += '</div>';
            }    
        }
        container.html(html).show();
        return false;
    }
    if(obj.type=='susun_semula'){
        var hint =  JSON.parse(JSON.stringify(obj.hint));
        var answer = JSON.parse(JSON.stringify(obj.answer));
        var question = JSON.parse(JSON.stringify(obj.question));
    
        for(var x in hint.data){
            var q = hint.data[x];
            data.count++;
            if(contentAnalys(q.content)==false){
                hint.data.splice(x,1);
            }    
        }
    
        for(var x in answer.data){
            var q = answer.data[x];
            data.count++;
            if(contentAnalys(q.content)==false){
                answer.data.splice(x,1);
            }    
        }
    
        var html = '';
    
        if(cond=='hint'){
            data.count = 0;
            for(var x in hint.data){
                var q = hint.data[x];
                data.count++;
                //console.log(data.count+' '+count);
                if(data.count<=count){
                    html +=   '<div class="view-row no-line">';
                    html +=      '<div class="view-col border-right col-seq">';
                    html +=         '<div>'+
                                        data.count+' / '+hint.data.length;
                    html +=         '</div>';
                    html +=      '</div>'+
                                    '<div class="view-col" style="width:85%">'+
                                        '<div>'+q.content+'</div>'+
                                    '</div>';
                    html +=   '</div>'; 
                    if(data.count==count){
                        break;
                    }
                }
            }
            var another = data.count + 1;
            html += '<div class="view-row text-bold no-line">'+
                        '<div class="view-col"  style="width:100%;text-align:left;">';
                        if(count < hint.data.length){
            html +=        '<div data-count="'+another+'" class="btn-more btn-morehint">'+
                                '<i class="fa fa-plus"></i> Get another hint ('+data.count+'/'+hint.data.length+')'+
                            '</div>';
                        }else{
            html +=     '<div class="btn-more">'+
                            'Hint ('+data.count+'/'+hint.data.length+')'+
                        '</div>';
                        }
            html +=     '</div>'+
                    '</div>';
    
        }
        if(cond=='description'){    
            for(var x in question.data){
                var q = question.data[x];
                data.hasAnswer = false;
                for(var y in answer.data){
                    var a = answer.data[y];
                    if(q.id==a.assign){
                        data.hasAnswer = true;
                        data.content = a.content;
                        break;
                    }
        
                }
                if(data.hasAnswer==true){
                    if(answer.type==undefined || answer.type == null){
                        answer.type = 'horizontal';
                    }
                    data.count2 = 0;
                    html +=   '<div class="view-row padding-0" style="flex-wrap: wrap;">';
                    html +=      '<div class="view-col" style="width:50%;">';
                    html +=         '<div class="row-reorder no-reorder">';
                    html +=            '<ul class="tpl-sortable '+answer.type+'">';
                                            input = q.content;
                                            if(input==null || input==''){
                                                //return false;
                                            }else{
                                                //replaceAll('(?i)<(?!img|/img).*?>', '');
                                                //input = input.replace(/(<([^>]+)>)/ig, "");
                                                input = input.replace(/<\/?(?!img)\w*\b[^>]*>/ig, '');
                                            }                               
                                            var arr = input.split(/\s+(?=[^\])}]*([\[({]|$))/);
                                            for(var x in arr){
                                                if(arr[x].indexOf('[')!=-1){
                                                    arr[x] = arr[x].replace(/&nbsp;|<br>/g,"");
                                                    //var clean = arr[x].replace(/[^a-z0-9\s]/gi, '').replace(/[_\s]/g, ' ');
                                                    var clean = arr[x].replace(/\[/g,"").replace(/\]/g,"");
                                                    if(arr[x]=='['+clean+']'){
                    html+=                             '<li><div class="hide value">'+clean+'</div>'+clean+'</li> ';            
                                                    }
                                                }
                                            }
                    html +=             '</ul>';
                    html +=         '</div>';
                    html +=      '</div>';
                    html +=      '<div class="view-col wrapper-reorder" style="width:50%;">';
                    html +=         '<div class="row-reorder reorder correct">';
                    html +=            '<ul class="tpl-sortable '+answer.type+'">';
                                            input = data.content;
                                            if(input==null || input==''){
                                                //return false;
                                            }else{
                                                //replaceAll('(?i)<(?!img|/img).*?>', '');
                                                //input = input.replace(/(<([^>]+)>)/ig, "");
                                                input = input.replace(/<\/?(?!img)\w*\b[^>]*>/ig, '');
                                            }                               
                                            var arr = input.split(/\s+(?=[^\])}]*([\[({]|$))/);
                                            for(var x in arr){
                                                if(arr[x].indexOf('[')!=-1){
                                                    arr[x] = arr[x].replace(/&nbsp;|<br>/g,"");
                                                    //var clean = arr[x].replace(/[^a-z0-9\s]/gi, '').replace(/[_\s]/g, ' ');
                                                    var clean = arr[x].replace(/\[/g,"").replace(/\]/g,"");
                                                    if(arr[x]=='['+clean+']'){
                    html+=                            '<li><div class="hide value">'+clean+'</div>'+clean+'</li> ';            
                                                    }
                                                }
                                            }
                    html +=             '</ul>';
                    html +=         '</div>';
                    html +=      '</div>';
                                if(a.descriptionList!=undefined){
                                    if(a.descriptionList!=null){
                    html +=     '<div class="view-col">';
                                        for(var x in a.descriptionList){
                                            var d = a.descriptionList[x];
                                            data.count2++;
                                            if(contentAnalys(d.content)!=false){
                                                html +=   '<div class="view-row no-line" style="padding-top: 0px;">';
                                                html +=      '<div class="view-col border-right col-seq">';
                                                html +=         '<div>'+
                                                                    data.count2+' / '+a.descriptionList.length;
                                                html +=         '</div>';
                                                html +=      '</div>'+
                                                            '<div class="view-col" style="width:85%">'+
                                                                '<div>'+d.content+'</div>'+
                                                            '</div>';
                                                html +=   '</div>'; 
                                            }    
                                        }
                                        html += '<div class="view-row text-bold no-line">'+
                                                    '<div class="view-col"  style="width:100%;text-align:left;">'+
                                                        '<div class="btn-more">'+
                                                            'Answer Description ('+a.descriptionList.length+'/'+a.descriptionList.length+')'+
                                                        '</div>'+
                                                    '</div>'+
                                                '</div>';
                    html +=     '</div>';
                                    }
                                }else{
                    html +=     '<div class="view-col">';
                                    html += '<div class="view-row text-bold no-line">'+
                                        '<div class="view-col"  style="width:100%;text-align:left;">'+
                                            '<div class="btn-more">'+
                                                'Answer Description (0/0)'+
                                            '</div>'+
                                        '</div>'+
                                    '</div>';
                    html +=     '</div>';
                                }
                    html +=   '</div>'; 
        
                }           
            }
       
        }
        container.html(html).show();
        return false;
    }
    if(obj.type=='isi_tempat_kosong'){
        var hint =  JSON.parse(JSON.stringify(obj.hint));
        var answer = JSON.parse(JSON.stringify(obj.answer));
        var question = JSON.parse(JSON.stringify(obj.question));
    
        for(var x in hint.data){
            var q = hint.data[x];
            data.count++;
            if(contentAnalys(q.content)==false){
                hint.data.splice(x,1);
            }    
        }
    
        for(var x in answer.data){
            var q = answer.data[x];
            data.count++;
            if(contentAnalys(q.content)==false){
                answer.data.splice(x,1);
            }    
        }
    
        var html = '';
    
        if(cond=='hint'){
            data.count = 0;
            for(var x in hint.data){
                var q = hint.data[x];
                data.count++;
                //console.log(data.count+' '+count);
                if(data.count<=count){
                    html +=   '<div class="view-row no-line">';
                    html +=      '<div class="view-col border-right col-seq">';
                    html +=         '<div>'+
                                        data.count+' / '+hint.data.length;
                    html +=         '</div>';
                    html +=      '</div>'+
                                    '<div class="view-col" style="width:85%">'+
                                        '<div>'+q.content+'</div>'+
                                    '</div>';
                    html +=   '</div>'; 
                    if(data.count==count){
                        break;
                    }
                }
            }
            var another = data.count + 1;
            html += '<div class="view-row text-bold no-line">'+
                        '<div class="view-col"  style="width:100%;text-align:left;">';
                        if(count < hint.data.length){
            html +=        '<div data-count="'+another+'" class="btn-more btn-morehint">'+
                                '<i class="fa fa-plus"></i> Get another hint ('+data.count+'/'+hint.data.length+')'+
                            '</div>';
                        }else{
            html +=     '<div class="btn-more">'+
                            'Hint ('+data.count+'/'+hint.data.length+')'+
                        '</div>';
                        }
            html +=     '</div>'+
                    '</div>';
    
        }
        if(cond=='description'){   
            //creating question html
            for(var x in question.data){
                var q = question.data[x];
    
                data.hasAnswer = false; 
                for(var y in answer.data){
                    var a = answer.data[y];
                    if(a.assign!=undefined){
                        if(a.assign!=null){
                            if(a.assign.toString().indexOf(q.id)>-1){
                                data.hasAnswer = true; 
                                break;
                            }
                        }
                    }
                }
                if(data.hasAnswer==true){
                    html +=   '<div class="view-row" style="flex-wrap: wrap;">';
                    html +=      '<div class="view-col" style="width:100%;display:flex;align-items:center;line-height: 2.5;">';
                    html +=        '<div>';
    
                        var input = q.content;
                        if(input==null || input==''){
                            return false;
                        }else{
                            input = input.replace(/<\/?(?!img)\w*\b[^>]*>/ig, '');
                        }
                        var arr = input.split(/\s+(?=[^\])}]*([\[({]|$))/);
                        data.count3 = 0;
                        for(var x in arr){
                            if(arr[x].indexOf('[')!=-1){
                                arr[x] = arr[x].replace(/&nbsp;|<br>/g,"");
                                var clean = arr[x].replace(/\[/g,"").replace(/\]/g,"");
                                if(arr[x]=='['+clean+']'){
                                    data.content = '';
                                    for(var y in answer.data){
                                        var a = answer.data[y];
                                        if(a.assign!=undefined){
                                            if(a.assign!=null){
                                                if(a.assign.toString().indexOf(q.id)>-1){
                                                    if(a.assign.toString()==q.id+' '+clean){
                                                        data.count3++;
                                                        data.content = a.content;
                                                    }
                                                }
                                            }
                                        }
                                    }
                                
                                    if(answer.type=='select'){
                    html +=             '<div class="tpl-dropdown bottom-line">'+
                                            '<div class="dropdown-parent"><span style="font-weight:bold;float: left;padding-right: 5px;padding-left: 5px;">Ans '+data.count3+': </span> '+data.content+'</div>'+
                                    '</div>';
                                    }
                                    if(answer.type=='fill' || answer.type==undefined || answer.type==null){
                    html +=             '<div class="tpl-input tpl-fill"><span style="font-weight:bold;float: left;padding-right: 5px;padding-left: 5px;">Ans '+data.count3+': </span> '+data.content+'</div>';
                                    }
                                        
                                }
                            }else{  
                    html +=           ' '+arr[x]+' '; 
                    //             data.hasAnswer = false; 
                    //             for(var y in answer.data){
                    //                 var a = answer.data[y];
                    //                 if(a.assign!=undefined){
                    //                     if(a.assign!=null){
                    //                         if(a.assign.toString().indexOf(q.id)>-1){
                    //                             data.hasAnswer = true; 
                    //                             break;
                    //                         }
                    //                     }
                    //                 }
                    //             }
                    
                    //            if(data.hasAnswer==true){
                    // html +=           ' '+arr[x]+' ';
                    //            }
                            }
                        }
                    html +=          '</div>';
                    html +=        '</div>';
    
                    var input = q.content;
                    if(input==null || input==''){
                        return false;
                    }else{
                        input = input.replace(/<\/?(?!img)\w*\b[^>]*>/ig, '');
                    }
                    var arr = input.split(/\s+(?=[^\])}]*([\[({]|$))/);
                    data.count3= 0;
                    for(var x in arr){
                        if(arr[x].indexOf('[')!=-1){
                            arr[x] = arr[x].replace(/&nbsp;|<br>/g,"");
                            var clean = arr[x].replace(/\[/g,"").replace(/\]/g,"");
                            if(arr[x]=='['+clean+']'){
                                data.content = '';
                                for(var y in answer.data){
                                    var a = answer.data[y];
                                    if(a.assign!=undefined){
                                        if(a.assign!=null){
                                            if(a.assign.toString().indexOf(q.id)>-1){
                                                if(a.assign.toString()==q.id+' '+clean){
                                                    data.count3++;
                                                    data.count = 0;
                                                    data.count2 = 0;
                                        html +=     '<div class="view-col" style="width:100%;font-weight:bold;">Ans '+data.count3+'</div>';
                                                    if(a.answerList!=undefined){
                                                        if(a.answerList!=null){
                                        html +=     '<div class="view-col" style="width:100%;">';
                                                            for(var x in a.answerList){
                                                                var d = a.answerList[x];
                                                                data.count++;
                                                                if(contentAnalys(d.content)!=false){
                                                                    html +=   '<div class="view-row no-line" style="padding-top: 0px;">';
                                                                    html +=      '<div class="view-col border-right col-seq">';
                                                                    html +=         '<div>'+
                                                                                        data.count+' / '+a.answerList.length;
                                                                    html +=         '</div>';
                                                                    html +=      '</div>'+
                                                                                '<div class="view-col" style="width:85%">'+
                                                                                    '<div>'+d.content+'</div>'+
                                                                                '</div>';
                                                                    html +=   '</div>'; 
                                                                }    
                                                            }
                                                            html += '<div class="view-row text-bold no-line">'+
                                                                        '<div class="view-col"  style="width:100%;text-align:left;">'+
                                                                            '<div class="btn-more">'+
                                                                                'Possible Answer ('+a.answerList.length+'/'+a.answerList.length+')'+
                                                                            '</div>'+
                                                                        '</div>'+
                                                                    '</div>';
                                        html +=     '</div>';
                                                        }
                                                    }else{
                                        html +=     '<div class="view-col" style="width:100%;">';
                                                        html += '<div class="view-row text-bold no-line">'+
                                                                    '<div class="view-col"  style="width:100%;text-align:left;">'+
                                                                        '<div class="btn-more">'+
                                                                            'Possible Answer (0/0)'+
                                                                        '</div>'+
                                                                    '</div>'+
                                                                '</div>';
                                        html +=     '</div>';
                                                    }
                                                    if(a.descriptionList!=undefined){
                                                        if(a.descriptionList!=null){
                                        html +=     '<div class="view-col" style="width:100%;">';
                                                            for(var x in a.descriptionList){
                                                                var d = a.descriptionList[x];
                                                                data.count2++;
                                                                if(contentAnalys(d.content)!=false){
                                                                    html +=   '<div class="view-row no-line" style="padding-top: 0px;">';
                                                                    html +=      '<div class="view-col border-right col-seq">';
                                                                    html +=         '<div>'+
                                                                                        data.count2+' / '+a.descriptionList.length;
                                                                    html +=         '</div>';
                                                                    html +=      '</div>'+
                                                                                '<div class="view-col" style="width:85%">'+
                                                                                    '<div>'+d.content+'</div>'+
                                                                                '</div>';
                                                                    html +=   '</div>'; 
                                                                }    
                                                            }
                                                            html += '<div class="view-row text-bold no-line">'+
                                                                        '<div class="view-col"  style="width:100%;text-align:left;">'+
                                                                            '<div class="btn-more">'+
                                                                                'Answer Description ('+a.descriptionList.length+'/'+a.descriptionList.length+')'+
                                                                            '</div>'+
                                                                        '</div>'+
                                                                    '</div>';
                                        html +=     '</div>';
                                                        }
                                                    }else{
                                        html +=     '<div class="view-col" style="width:100%;">';
                                                        html += '<div class="view-row text-bold no-line">'+
                                                                    '<div class="view-col"  style="width:100%;text-align:left;">'+
                                                                        '<div class="btn-more">'+
                                                                            'Answer Description (0/0)'+
                                                                        '</div>'+
                                                                    '</div>'+
                                                                '</div>';
                                        html +=     '</div>';
                                                    }
                                        html +=     '<div class="view-col" style="width:100%;border-top: 1px solid #eee;"></div>';
                                                }
                                            }
                                        }
                                    }
                                }
                                    
                            }
                        }
                    }
                }
                html +=     '</div>';
            
            } 
       
        }
        container.html(html).show();
        return false;
    }
    if(obj.type=='padanan'){
        var hint =  JSON.parse(JSON.stringify(obj.hint));
        var answer = JSON.parse(JSON.stringify(obj.answer));
    
        for(var x in hint.data){
            var q = hint.data[x];
            data.count++;
            if(contentAnalys(q.content)==false){
                hint.data.splice(x,1);
            }    
        }
        for(var x in answer.data){
            var q = answer.data[x];
            data.count++;
            if(contentAnalys(q.content.left)==false){
                answer.data.splice(x,1);
            }    
        }
    
        for(var x in answer.data){
            var q = answer.data[x];
            data.count++;
            if(contentAnalys(q.content.right)==false){
                answer.data.splice(x,1);
            }    
        }
    
        var html = '';
    
        if(cond=='hint'){
            data.count = 0;
            for(var x in hint.data){
                var q = hint.data[x];
                data.count++;
                //console.log(data.count+' '+count);
                if(data.count<=count){
                    html +=   '<div class="view-row no-line">';
                    html +=      '<div class="view-col border-right col-seq">';
                    html +=         '<div>'+
                                        data.count+' / '+hint.data.length;
                    html +=         '</div>';
                    html +=      '</div>'+
                                    '<div class="view-col" style="width:85%">'+
                                        '<div>'+q.content+'</div>'+
                                    '</div>';
                    html +=   '</div>'; 
                    if(data.count==count){
                        break;
                    }
                }
            }
            var another = data.count + 1;
            html += '<div class="view-row text-bold no-line">'+
                        '<div class="view-col"  style="width:100%;text-align:left;">';
                        if(count < hint.data.length){
            html +=        '<div data-count="'+another+'" class="btn-more btn-morehint">'+
                                '<i class="fa fa-plus"></i> Get another hint ('+data.count+'/'+hint.data.length+')'+
                            '</div>';
                        }else{
            html +=     '<div class="btn-more">'+
                            'Hint ('+data.count+'/'+hint.data.length+')'+
                        '</div>';
                        }
            html +=     '</div>'+
                    '</div>';
    
        }
        if(cond=='description'){    
            data.count = -1;
            for(var y in answer.data){
                var a = answer.data[y];  
                data.count++;         
                html +='<div class="view-row" style="flex-wrap: wrap;">';
                html +=      '<div class="view-col" style="width:50%;">';
                html +=         '<div>'+a.content.left;
                html +=         '</div>';
                html +=      '</div>';
                html +=       '<div class="view-col" style="width:50%">';
                html +=             '<div class="tpl-dropdown correct">'+
                                        '<div class="dropdown-parent">'+a.content.right+'</div>'+
                                    '</div>';
                html +=       '</div>';
                        data.count2 = 0;
                        if(a.descriptionList!=undefined){
                            if(a.descriptionList!=null){
                html +=     '<div class="view-col">';
                                for(var x in a.descriptionList){
                                    var d = a.descriptionList[x];
                                    data.count2++;
                                    if(contentAnalys(d.content)!=false){
                                        html +=   '<div class="view-row no-line" style="padding-top: 0px;">';
                                        html +=      '<div class="view-col border-right col-seq">';
                                        html +=         '<div>'+
                                                            data.count2+' / '+a.descriptionList.length;
                                        html +=         '</div>';
                                        html +=      '</div>'+
                                                    '<div class="view-col" style="width:85%">'+
                                                        '<div>'+d.content+'</div>'+
                                                    '</div>';
                                        html +=   '</div>'; 
                                    }    
                                }
                                html += '<div class="view-row text-bold no-line">'+
                                            '<div class="view-col"  style="width:100%;text-align:left;">'+
                                                '<div class="btn-more">'+
                                                    'Answer Description ('+a.descriptionList.length+'/'+a.descriptionList.length+')'+
                                                '</div>'+
                                            '</div>'+
                                        '</div>';
                html +=     '</div>';
                            }
                        }else{
                html +=     '<div class="view-col">';
                                html += '<div class="view-row text-bold no-line">'+
                                    '<div class="view-col"  style="width:100%;text-align:left;">'+
                                        '<div class="btn-more">'+
                                            'Answer Description (0/0)'+
                                        '</div>'+
                                    '</div>'+
                                '</div>';
                html +=    '</div>';
                            }
                html += '</div>';
                
    
            }    
        }
        container.html(html).show();
        return false;
    }
    if(obj.type=='benar_palsu'){
        var hint =  JSON.parse(JSON.stringify(obj.hint));
        var answer = JSON.parse(JSON.stringify(obj.answer));
        var question = JSON.parse(JSON.stringify(obj.question));
    
        for(var x in hint.data){
            var q = hint.data[x];
            data.count++;
            if(contentAnalys(q.content)==false){
                hint.data.splice(x,1);
            }    
        }
    
        for(var x in answer.data){
            var q = answer.data[x];
            data.count++;
            if(contentAnalys(q.content)==false){
                answer.data.splice(x,1);
            }    
        }
    
        var html = '';
    
        if(cond=='hint'){
            data.count = 0;
            for(var x in hint.data){
                var q = hint.data[x];
                data.count++;
                //console.log(data.count+' '+count);
                if(data.count<=count){
                    html +=   '<div class="view-row no-line">';
                    html +=      '<div class="view-col border-right col-seq">';
                    html +=         '<div>'+
                                        data.count+' / '+hint.data.length;
                    html +=         '</div>';
                    html +=      '</div>'+
                                    '<div class="view-col" style="width:85%">'+
                                        '<div>'+q.content+'</div>'+
                                    '</div>';
                    html +=   '</div>'; 
                    if(data.count==count){
                        break;
                    }
                }
            }
            var another = data.count + 1;
            html += '<div class="view-row text-bold no-line">'+
                        '<div class="view-col"  style="width:100%;text-align:left;">';
                        if(count < hint.data.length){
            html +=        '<div data-count="'+another+'" class="btn-more btn-morehint">'+
                                '<i class="fa fa-plus"></i> Get another hint ('+data.count+'/'+hint.data.length+')'+
                            '</div>';
                        }else{
            html +=     '<div class="btn-more">'+
                            'Hint ('+data.count+'/'+hint.data.length+')'+
                        '</div>';
                        }
            html +=     '</div>'+
                    '</div>';
    
        }
        if(cond=='description'){    
            for(var x in question.data){
                var q = question.data[x];
                data.hasAnswer = false;
                for(var y in answer.data){
                    var a = answer.data[y];
                    if(q.id==a.assign){
                        data.hasAnswer = true;
                        data.content = a.content;
                        break;
                    }
        
                }
                if(data.hasAnswer==true){
                    data.count2 = 0;
                    data.count3 = 0;
                    html +=   '<div class="view-row" style="flex-wrap: wrap;">';
                    html +=      '<div class="view-col" style="width:50%;">';
                    html +=         '<div>'+q.content;
                    html +=         '</div>';
                    html +=      '</div>';
                    html +=      '<div class="view-col" style="width:50%;">';
                                    if(answer.type=='select')  {
                    html +=            '<div class="tpl-dropdown correct">'+
                                            '<div class="dropdown-parent">'+data.content+'</div>'+
                                        '</div>';
                                    }
                                    if(answer.type=='multiple' || answer.type==undefined || answer.type==null)  {
                                        data.isCorrect = '';
                                        if(data.content=='True'){
                                            data.isCorrect = 'correct';
                                        }
                    html +=             '<div class="tpl-tickgroup '+data.isCorrect+'">'+
                                            '<div class="tick-box">'+
                                                '<div class="tick-no"><span class="no">T</span></div>'+
                                            '</div>'+
                                            '<div class="tick-content">True</div>'+
                                        '</div>';
                                        data.isCorrect = '';
                                        if(data.content=='False'){
                                            data.isCorrect = 'correct';
                                        }
                    html +=             '<div class="tpl-tickgroup '+data.isCorrect+'">'+
                                            '<div class="tick-box">'+
                                                '<div class="tick-no"><span class="no">F</span></div>'+
                                            '</div>'+
                                            '<div class="tick-content">False</div>'+
                                       '</div>';
                                    }
                    html +=      '</div>';
                                if(a.descriptionList!=undefined){
                                    if(a.descriptionList!=null){
                    html +=     '<div class="view-col" style="width:100%";>';
                                        for(var x in a.descriptionList){
                                            var d = a.descriptionList[x];
                                            data.count2++;
                                            if(contentAnalys(d.content)!=false){
                                                html +=   '<div class="view-row no-line" style="padding-top: 0px;">';
                                                html +=      '<div class="view-col border-right col-seq">';
                                                html +=         '<div>'+
                                                                    data.count2+' / '+a.descriptionList.length;
                                                html +=         '</div>';
                                                html +=      '</div>'+
                                                            '<div class="view-col" style="width:85%">'+
                                                                '<div>'+d.content+'</div>'+
                                                            '</div>';
                                                html +=   '</div>'; 
                                            }    
                                        }
                                        html += '<div class="view-row text-bold no-line">'+
                                                    '<div class="view-col"  style="width:100%;text-align:left;">'+
                                                        '<div class="btn-more">'+
                                                            'Answer Description for Correct Answer ('+a.descriptionList.length+'/'+a.descriptionList.length+')'+
                                                        '</div>'+
                                                    '</div>'+
                                                '</div>';
                    html +=     '</div>';
                                    }
                                }else{
                    html +=     '<div class="view-col" style="width:100%";>';
                                    html += '<div class="view-row text-bold no-line">'+
                                                '<div class="view-col"  style="width:100%;text-align:left;">'+
                                                    '<div class="btn-more">'+
                                                        'Answer Description for Correct Answer (0/0)'+
                                                    '</div>'+
                                                '</div>'+
                                            '</div>';
                    html +=     '</div>';
                                }
                                if(a.descriptionFalse!=undefined){
                                    if(a.descriptionFalse!=null){
                    html +=     '<div class="view-col" style="width:100%";>';
                                        for(var x in a.descriptionFalse){
                                            var d = a.descriptionFalse[x];
                                            data.count3++;
                                            if(contentAnalys(d.content)!=false){
                                                html +=   '<div class="view-row no-line" style="padding-top: 0px;">';
                                                html +=      '<div class="view-col border-right col-seq">';
                                                html +=         '<div>'+
                                                                    data.count3+' / '+a.descriptionFalse.length;
                                                html +=         '</div>';
                                                html +=      '</div>'+
                                                            '<div class="view-col" style="width:85%">'+
                                                                '<div>'+d.content+'</div>'+
                                                            '</div>';
                                                html +=   '</div>'; 
                                            }    
                                        }
                                        html += '<div class="view-row text-bold no-line">'+
                                                    '<div class="view-col"  style="width:100%;text-align:left;">'+
                                                        '<div class="btn-more">'+
                                                            'Answer Description for Wrong Answer ('+a.descriptionFalse.length+'/'+a.descriptionFalse.length+')'+
                                                        '</div>'+
                                                    '</div>'+
                                                '</div>';
                    html +=     '</div>';
                                    }
                                }else{
                    html +=     '<div class="view-col" style="width:100%";>';
                                    html += '<div class="view-row text-bold no-line">'+
                                                '<div class="view-col"  style="width:100%;text-align:left;">'+
                                                    '<div class="btn-more">'+
                                                        'Answer Description for Wrong Answer (0/0)'+
                                                    '</div>'+
                                                '</div>'+
                                            '</div>';
                    html +=     '</div>';
                                }
                                
                    html +=   '</div>'; 
        
                }        
            }
       
        }
        container.html(html).show();
        return false;
    }
    if(obj.type=='pengelasan'){
        var hint =  JSON.parse(JSON.stringify(obj.hint));
        var answer = JSON.parse(JSON.stringify(obj.answer));
        var question = JSON.parse(JSON.stringify(obj.question));
    
        for(var x in hint.data){
            var q = hint.data[x];
            data.count++;
            if(contentAnalys(q.content)==false){
                hint.data.splice(x,1);
            }    
        }
    
        for(var x in answer.data){
            var q = answer.data[x];
            data.count++;
            if(contentAnalys(q.content)==false){
                answer.data.splice(x,1);
            }    
        }
    
        var html = '';
    
        if(cond=='hint'){
            data.count = 0;
            for(var x in hint.data){
                var q = hint.data[x];
                data.count++;
                //console.log(data.count+' '+count);
                if(data.count<=count){
                    html +=   '<div class="view-row no-line">';
                    html +=      '<div class="view-col border-right col-seq">';
                    html +=         '<div>'+
                                        data.count+' / '+hint.data.length;
                    html +=         '</div>';
                    html +=      '</div>'+
                                    '<div class="view-col" style="width:85%">'+
                                        '<div>'+q.content+'</div>'+
                                    '</div>';
                    html +=   '</div>'; 
                    if(data.count==count){
                        break;
                    }
                }
            }
            var another = data.count + 1;
            html += '<div class="view-row text-bold no-line">'+
                        '<div class="view-col"  style="width:100%;text-align:left;">';
                        if(count < hint.data.length){
            html +=        '<div data-count="'+another+'" class="btn-more btn-morehint">'+
                                '<i class="fa fa-plus"></i> Get another hint ('+data.count+'/'+hint.data.length+')'+
                            '</div>';
                        }else{
            html +=     '<div class="btn-more">'+
                            'Hint ('+data.count+'/'+hint.data.length+')'+
                        '</div>';
                        }
            html +=     '</div>'+
                    '</div>';
    
        }
        if(cond=='description'){   
            //creating question html
            for(var x in question.data){
                var q = question.data[x];
    
                data.hasAnswer = false; 
                for(var y in answer.data){
                    var a = answer.data[y];
                    if(a.assign!=undefined){
                        if(a.assign!=null){
                            if(a.assign.toString().indexOf(q.id)>-1){
                                data.hasAnswer = true; 
                                break;
                            }
                        }
                    }
                }
                if(data.hasAnswer==true){
                    html +=   '<div class="view-row" style="flex-wrap: wrap;">';
                    html +=      '<div class="view-col" style="width:100%;display:flex;align-items:center;line-height: 2.5;">';
                    html +=        '<div>';
    
                        var input = q.content;
                        if(input==null || input==''){
                            return false;
                        }else{
                            input = input.replace(/<\/?(?!img)\w*\b[^>]*>/ig, '');
                        }
                        var arr = input.split(/\s+(?=[^\])}]*([\[({]|$))/);
                        data.count3 = 0;
                        for(var x in arr){
                            if(arr[x].indexOf('[')!=-1){
                                arr[x] = arr[x].replace(/&nbsp;|<br>/g,"");
                                var clean = arr[x].replace(/\[/g,"").replace(/\]/g,"");
                                if(arr[x]=='['+clean+']'){
                                    data.content = '';
                                    for(var y in answer.data){
                                        var a = answer.data[y];
                                        if(a.assign!=undefined){
                                            if(a.assign!=null){
                                                if(a.assign.toString().indexOf(q.id)>-1){
                                                    var assign = a.assign.split(',');
                                                    for(var z in assign){
                                                        if(assign[z].toString().trim()==q.id+' '+clean.trim()){
                                                            data.count3++;
                                                            data.content = a.content;
                                                            break;
                                                        }
    
                                                    }
                                                }
                                            }
                                        }
                                    }
                                
                                    if(answer.type=='select' || answer.type==undefined || answer.type==null){
                    html +=             '<div class="tpl-dropdown bottom-line">'+
                                            '<div class="dropdown-parent"><span style="font-weight:bold;float: left;padding-right: 5px;padding-left: 5px;">Ans '+data.count3+': </span> '+data.content+'</div>'+
                                    '</div>';
                                    }
                                    if(answer.type=='fill'){
                    html +=             '<div class="tpl-input tpl-fill"><span style="font-weight:bold;float: left;padding-right: 5px;padding-left: 5px;">Ans '+data.count3+': </span> '+data.content+'</div>';
                                    }
                                        
                                }
                            }else{  
                    html +=           ' '+arr[x]+' '; 
    
                            }
                        }
                    html +=          '</div>';
                    html +=        '</div>';
    
                    var input = q.content;
                    if(input==null || input==''){
                        return false;
                    }else{
                        input = input.replace(/<\/?(?!img)\w*\b[^>]*>/ig, '');
                    }
                    var arr = input.split(/\s+(?=[^\])}]*([\[({]|$))/);
                    data.count3= 0;
                    for(var x in arr){
                        if(arr[x].indexOf('[')!=-1){
                            arr[x] = arr[x].replace(/&nbsp;|<br>/g,"");
                            var clean = arr[x].replace(/\[/g,"").replace(/\]/g,"");
                            if(arr[x]=='['+clean+']'){
                                data.content = '';
                                for(var y in answer.data){
                                    var a = answer.data[y];
                                    if(a.assign!=undefined){
                                        if(a.assign!=null){
                                            if(a.assign.toString().indexOf(q.id)>-1){
                                                var assign = a.assign.split(',');
                                                for(var z in assign){
                                                        if(assign[z].toString().trim()==q.id+' '+clean.trim()){
                                                        data.count3++;
                                                        data.count = 0;
                                                        data.count2 = 0;
                                            html +=     '<div class="view-col" style="width:100%;font-weight:bold;">Ans '+data.count3+'</div>';
                                            //             if(a.answerList!=undefined){
                                            //                 if(a.answerList!=null){
                                            // html +=     '<div class="view-col" style="width:100%;">';
                                            //                     for(var x in a.answerList){
                                            //                         var d = a.answerList[x];
                                            //                         data.count++;
                                            //                         if(contentAnalys(d.content)!=false){
                                            //                             html +=   '<div class="view-row no-line" style="padding-top: 0px;">';
                                            //                             html +=      '<div class="view-col border-right col-seq">';
                                            //                             html +=         '<div>'+
                                            //                                                 data.count+' / '+a.answerList.length;
                                            //                             html +=         '</div>';
                                            //                             html +=      '</div>'+
                                            //                                         '<div class="view-col" style="width:85%">'+
                                            //                                             '<div>'+d.content+'</div>'+
                                            //                                         '</div>';
                                            //                             html +=   '</div>'; 
                                            //                         }    
                                            //                     }
                                            //                     html += '<div class="view-row text-bold no-line">'+
                                            //                                 '<div class="view-col"  style="width:100%;text-align:left;">'+
                                            //                                     '<div class="btn-more">'+
                                            //                                         'Possible Answer ('+a.answerList.length+'/'+a.answerList.length+')'+
                                            //                                     '</div>'+
                                            //                                 '</div>'+
                                            //                             '</div>';
                                            // html +=     '</div>';
                                            //                 }
                                            //             }else{
                                            // html +=     '<div class="view-col" style="width:100%;">';
                                            //                 html += '<div class="view-row text-bold no-line">'+
                                            //                             '<div class="view-col"  style="width:100%;text-align:left;">'+
                                            //                                 '<div class="btn-more">'+
                                            //                                     'Possible Answer (0/0)'+
                                            //                                 '</div>'+
                                            //                             '</div>'+
                                            //                         '</div>';
                                            // html +=     '</div>';
                                            //             }
                                                        if(a.descriptionList!=undefined){
                                                            if(a.descriptionList!=null){
                                            html +=     '<div class="view-col" style="width:100%;">';
                                                                for(var x in a.descriptionList){
                                                                    var d = a.descriptionList[x];
                                                                    data.count2++;
                                                                    if(contentAnalys(d.content)!=false){
                                                                        html +=   '<div class="view-row no-line" style="padding-top: 0px;">';
                                                                        html +=      '<div class="view-col border-right col-seq">';
                                                                        html +=         '<div>'+
                                                                                            data.count2+' / '+a.descriptionList.length;
                                                                        html +=         '</div>';
                                                                        html +=      '</div>'+
                                                                                    '<div class="view-col" style="width:85%">'+
                                                                                        '<div>'+d.content+'</div>'+
                                                                                    '</div>';
                                                                        html +=   '</div>'; 
                                                                    }    
                                                                }
                                                                html += '<div class="view-row text-bold no-line">'+
                                                                            '<div class="view-col"  style="width:100%;text-align:left;">'+
                                                                                '<div class="btn-more">'+
                                                                                    'Answer Description ('+a.descriptionList.length+'/'+a.descriptionList.length+')'+
                                                                                '</div>'+
                                                                            '</div>'+
                                                                        '</div>';
                                            html +=     '</div>';
                                                            }
                                                        }else{
                                            html +=     '<div class="view-col" style="width:100%;">';
                                                            html += '<div class="view-row text-bold no-line">'+
                                                                        '<div class="view-col"  style="width:100%;text-align:left;">'+
                                                                            '<div class="btn-more">'+
                                                                                'Answer Description (0/0)'+
                                                                            '</div>'+
                                                                        '</div>'+
                                                                    '</div>';
                                            html +=     '</div>';
                                                        }
                                            // html +=     '<div class="view-col" style="width:100%;border-top: 1px solid #eee;"></div>';
                                                       break;
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                                    
                            }
                        }
                    }
                }
                html +=     '</div>';
            
            } 
       
        }
        container.html(html).show();
        return false;
    }
}

function getPossibleAns(obj, compare){
    state = false;
    for(var x in obj){
        if(obj[x].content!=undefined && obj[x].content!=null){
            if(obj[x].content.toLowerCase().trim()==compare.toLowerCase().trim()){
                state = true;
                break;
            }
        }
    }
    return state;
}
    
function getParentHTML(obj){
    var html = '';
    if(obj.parent!=undefined){
        var parent =  JSON.parse(JSON.stringify(obj.parent));
        for(var x in parent.data){
            var q = parent.data[x];
            if(contentAnalys(q.content)==false){
                parent.data.splice(x,1);
            }    
        }
        for(var x in parent.data){
            var q = parent.data[x];
                html +=   '<div class="view-row no-line">';
                html +=      '<div class="view-col" style="width:100%;">';
                html +=         '<div>'+q.content;
                html +=         '</div>';
                html +=      '</div>';
                html +=   '</div>'; 
            
        }

    }
    return html;
}

function getViewDetailHTML(obj){
    var html = '';
    html +='<div class="view-group question-hint"></div>';
    html +='<div class="view-group question-description '+obj.itemType+'"></div>';
    html += '<div class="view-group question-action">'+
                '<div class="view-row text-bold item-right">';
                if(obj.hide.search('hint')<=-1){
    html +=         '<div data-type="hint" class="view-col btn-showdetail">'+
                        'Show Hint'+
                    '</div>';
                }
                if((obj.hide.search('description')<=-1) && (obj.itemType=='view-subjective')){
    html +=         '<div data-type="description" class="view-col btn-showdetail">'+
                        'Show Answer Scheme'+
                    '</div>';
                }
                if((obj.hide.search('description')<=-1) && (obj.itemType!='view-subjective')){
    html +=         '<div data-type="description" class="view-col btn-showdetail">'+
                        'Show Answer Description'+
                    '</div>';
                }
    html +=
                '</div>'+
            '</div>';
    return html;
}

function getAnswerDetailHTML(obj){
    var html = '';
    if(obj.stuckHTML==undefined){
        obj.stuckHTML = 'Watch a video or use a hint.';
    }
    html +='<div class="view-group question-hint" >'+obj.hintHTML+'</div>';
    html +='<div class="view-group question-description '+obj.itemType+'"></div>';
    html += '<div class="view-group question-action">'+
                '<div class="view-row text-bold item-left">';
                if(obj.hide.search('hint')<=-1){
    html +=         '<div data-type="hint" class="view-col" style="width:100%;text-align: left;">'+
                        '<span style="color: #444;">Stuck?</span> <span class="btn-showhint"> '+obj.stuckHTML+'</span>'+
                    '</div>';
                }
                        // '<div data-type="description" class="view-col btn-showdetail" style="width:100%;">'+
                        //    // '<span style="color: #888D93;font-weight:normal;">Report a problem</span>'+
                        // '</div>'+
    html +=     '</div>'+
            '</div>';
    return html;
}

jQuery.fn.extend({
    autoHeight: function () {
        function autoHeight_(element) {
        return jQuery(element)
            .css({ 'height': 'auto', 'overflow-y': 'hidden' })
            .height(element.scrollHeight);
        }
        return this.each(function() {
        autoHeight_(this).on('input', function() {
            autoHeight_(this);
        });
        });
    }
});