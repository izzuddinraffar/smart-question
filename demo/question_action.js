
var bulk = {}; 
    bulk.obj = {};
    bulk.tpl = {};
    bulk.tpl.ht;

var difficulty= [
    {id:1, name:'Basic', icon:'c1.png'},
    {id:2, name:'Intermediate' , icon:'c4.png'},
    {id:3, name:'Proficient' , icon:'c5.png'}
];

$(document).ready(function(){
    $.ajax({
        url: 'tpl_ht.html',
        type :'GET',
        cache: false,
        async: false,
        beforeSend : function(){  
        },
      })
      .done(function(resp) {
        bulk.tpl.ht = resp;
    });

    $.ajax({
        url: 'question_list.json',
        dataType :'json',
        type :'GET',
        cache: false,
        async: false,
        beforeSend : function(){  
    
        },
      })
      .done(function(resp) {
        getQuestionView(resp);
    });
});



function getQuestionView(object){
    var divCount = 0;
    var questionCount = 0;
    for(var x in object){
        var item = convertObj(object[x]);
        console.log(item);
        divCount++;

         //insert object  into variable
        var question = item.obj.question;
        var answer = item.obj.answer;
        var hint = item.obj.hint;
        var scheme = item.obj.scheme;
        var properties = item.obj.properties;
        var source = item.obj.source;

        var container1 = '#questionView';

        item.isParent = false;
        var contentHTML = '<div style="width:100%;" class="question-content"></div>';
        var assetHTML = '<div style="width:150px;padding-top: 10px;" class="question-asset">{assetHTML}</div>';

        var cIcon = '';
        var cName = '';
        for(var c in difficulty){
            if(difficulty[c].id== properties.competency_level){
                cName = difficulty[c].name;
                cIcon = difficulty[c].icon;
            }
        } 

        //create asset view
        var html = '';
            html+=     '<div class="group-asset">'+
                          '<div style="font-size:12px;color: #666;font-weight:bold;">'+question.code+'</div>'+
                       '</div>';   
        if(properties.type==null || properties.type.toLowerCase()!='parent'){
            html+=     '<div class="group-asset">'+
                            '<div class="td-icon-item" style="justify-content:end; display: inline-flex;">'+
                                '<div class="tdi-icon" style="background:#fff;">'+
                                    '<img src="http://cloudhub.my/app/simpana/img/competency_level/'+cIcon+'" style="width:100%;">'+
                                '</div>'+
                                '<div class="tdi-text">'+cName+'</div>'+
                            '</div>'+
                        '</div>';
        }
        if(properties.type==null || properties.type.toLowerCase()=='parent'){
            html+=      '<div class="group-asset">'+
                            '<div class="td-icon-item" style="justify-content:end;display: inline-flex;">'+
                                '<div style="border: solid 1px #428cc6;padding: 4px;background:#fff;">';
                                 if(source.type.toLowerCase()=='pelangi'){
            html+=                   '<img src="http://cloudhub.my/app/simpana/img/logo/contributor/pelangi.png" style="height:110px;">';
                                 }else if(source.type.toLowerCase()=='learn2score'){
            html+=                   '<img src="https://hometutor.com.my/wp-content/uploads/2017/05/l2s.png" alt="new_logo" class="alignnone size-full wp-image-144" style="height: 100%;">';
                                 }
            html+=               '</div>'+
                             '</div>'+
                       '</div>';
        }
        assetHTML = assetHTML.replace('{assetHTML}', html);

       var scoreHTML ='<div class="view-row no-line">'+
                        '<div class="view-col item-right" style="width:100%">'+
                        '[<span class="mark-no">'+Math.round(question.score)+'</span> <span class="mark-desc">markah</span>]'+
                        '</div> '+  
                     '</div>';
        var skippedState = 0;

        //create question view
        if(properties.category.toLowerCase()=='multiple'){
            $(container1).append('<div data-id="'+question.id+'" data-type="'+item.type+'"  data-index="'+divCount+'" class="question-group question-group-'+divCount+' '+current+'"></div>');
            if(properties.type.toLowerCase()=='parent'){
                item.isParent = true;
                $(container1).find('.question-group-'+divCount).addClass('item-left');
                $(container1).find('.question-group-'+divCount).append(contentHTML);
                $(container1).find('.question-group-'+divCount+' .question-content').smartQuestion({
                    obj : item,
                    done : function(){
                        $(container1).find('.question-group-'+divCount+' .question-content .view-group').append(scoreHTML);
                        var selected = this;
                        selected.closest('.question-group').find('.ht-asset .code').html(question.code);
                        var imgHTML = '';
                        if(source.type.toLowerCase()=='pelangi'){
                            imgHTML+=  '<img src="http://cloudhub.my/app/simpana/img/logo/contributor/pelangi.png">';
                        }
                        selected.closest('.question-group').find('.ht-asset.contributor').html(imgHTML);
                    },
                    onAnswer : function(){
                        console.log('click');
                    }
                });
            }else{
                questionCount++;
                var noHTML = '<div style="width:30px;padding: 10px 5px;" class="question-no">'+questionCount+'</div>';
                $(container1).find('.question-group-'+divCount).addClass('item-left');
                $(container1).find('.question-group-'+divCount).append(bulk.tpl.ht);
                $(container1).find('.question-group-'+divCount+' .ht-group.content').addClass('item-left').append(noHTML+contentHTML);
                $(container1).find('.question-group-'+divCount+' .question-content').smartQuestion({
                    obj : item,
                    done : function(){
                        if(properties.instrument.item.type=='subjective'){
                            $(container1).find('.question-group-'+divCount+' .question-content .answer-group').prepend(sketch.html);
                            $(container1).find('.question-group-'+divCount+' .question-content .answer-group').append(scoreHTML);
                        }
                        //$(container1).find('.question-group-'+divCount+' .question-content').append('<button style="float:right;" class="btn-check btn btn-primary"><span data-skippedstate="'+skippedState+'" class="data"></span>Check Answer</button>');
                        $(container1).find('.question-group-'+divCount+' .question-content').css('margin-bottom','40px');
                        var selected = this;
                        selected.closest('.question-group').find('.ht-asset .code').html(question.code);
                        var img = 'easy';
                        if(properties.competency_level==2){
                            img = 'moderate';
                        }
                        if(properties.competency_level==3){
                            img = 'difficult';
                        }
                        var imgHTML = '<img src="http://cloudhub.my/app/simpana/img/hometutor/difficulty/'+img+'.png" style="width:120px;height:40px">';
                        selected.closest('.question-group').find('.ht-asset .difficulty').html(imgHTML);
                    },
                    onAnswer : function(){
                        console.log('click');
                    }
                });
            }          
        }else{
            $(container1).append('<div data-id="'+question.id+'" data-type="'+item.type+'"  data-index="'+divCount+'"  class="question-group question-group-'+divCount+'"></div>');
                $(container1).find('.question-group-'+divCount).addClass('item-left');
                $(container1).find('.question-group-'+divCount).append(bulk.tpl.ht);
                $(container1).find('.question-group-'+divCount+' .ht-group.content').addClass('item-left').append(contentHTML);
                $(container1).find('.question-group-'+divCount+' .question-content').smartQuestion({
                    obj : item,
                    submitButton : '.btn-check',
                    onAnswer : function(){
                        console.log('onanswer');
                    },
                    onSubmit : function(){
                        console.log('onsubmit');
                    },
                    done : function(){
                        var selected = this;
                        selected.closest('.question-group').find('.ht-asset .code').html(question.code);
                        var img = 'easy';
                        if(properties.competency_level==2){
                            img = 'moderate';
                        }
                        if(properties.competency_level==3){
                            img = 'difficult';
                        }
                        var imgHTML = '<img src="http://cloudhub.my/app/simpana/img/hometutor/difficulty/'+img+'.png" style="width:120px;height:40px">';
                        selected.closest('.question-group').find('.ht-asset .difficulty').html(imgHTML);
        
                        var imgHTML = '';
                        if(source.type.toLowerCase()=='pelangi'){
                            imgHTML+=  '<img src="http://cloudhub.my/app/simpana/img/logo/contributor/pelangi.png">';
                        }
                        selected.closest('.question-group').find('.ht-asset.contributor').html(imgHTML);
                        if(properties.instrument.item.type=='subjective'){
                            var noHTML = '<div style="width:30px;padding: 10px 5px;" class="question-no"></div>';
                            $(container1).find('.question-group').prepend(noHTML);
                            $(container1).find('.question-group-'+divCount+' .question-content .answer-group').prepend(sketch.html);
                            $(container1).find('.question-group-'+divCount+' .question-content .answer-group').append(scoreHTML);
                        }
                       $(container1).find('.question-group-'+divCount+' .question-content').append('<button data-questionseq="'+divCount+'" style="float:right;" class="btn-check btn btn-primary"><span data-skippedstate="'+skippedState+'" class="data"></span>Check Answer</button>');
                       $(container1).find('.question-group-'+divCount+' .question-content').css('margin-bottom','40px');
                    }
                });
        }

        if(item.type=='susun_semula'){
            setSorting('view-reorder', item.answer.data);
        }
        
        if(bulk.obj.questions==undefined){
            bulk.obj.questions = [];
        }
        bulk.obj.questions.push(item);
    }
}

function convertObj(object){
    var item = {};
    item.obj = object;
    item.question = {};
    item.question.data = [];
    item.answer = {};
    item.answer.data = [];
    item.hint = {};
    item.hint.data = [];
    item.scheme = {};
    item.scheme.data = [];

    //insert object  into variable
    var question = item.obj.question;
    var answer = item.obj.answer;
    var hint = item.obj.hint;
    var scheme = item.obj.scheme;
    var properties = item.obj.properties;
    var source = item.obj.source;
   
    //generate question obj
    var obj = {};
    obj.dbId = question.id;
    obj.content = '';
    if(question.data==undefined || question.data==null){
        if(question.file!=null){
            obj.content += '<div><img src="'+question.file+'"></div>';
        }
        if(question.question!=null){
            obj.content += question.question;
        }
        item.question.data.push(obj);
    }else{
        item.question.data = question.data;
        for(var x in item.question.data){
            item.question.data[x].dbId = question.id;
            item.question.data[x].seq = null;
        }
    }
    // if(question.content!=null){
    //     obj.content += question.content;
    // }

    if(properties.instrument.item.type=='mcq'){
        for(var y in answer){
            var a = answer[y];
            var obj = {};
            obj.dbId = a.id;
            obj.content = '';
            obj.assign = false;
            obj.descriptionList = [];
            if(a.file!=null){
                obj.content += '<div><img src="'+a.file+'"></div>';
            }
            if(a.answer_option!=null){
                obj.content += a.answer_option;
            }
            if(a.content!=null){
                obj.content += a.content;
            }
            if(a.is_correct_answer=='1'){
                obj.assign = true;
            }
            var obj2 = {};
            obj2.content = '';
            for(var y in a.descriptionList){
                var d = a.descriptionList[y];
                if(d.file!=null){
                    obj2.content += '<div><img src="'+d.file+'"></div>';
                }
                if(d.text!=null){
                    obj2.content += d.text;
                }
                if(d.content!=null){
                    obj.descriptionList = a.descriptionList;
                }else{
                    obj.descriptionList.push(obj2);
                }
            } 
            item.answer.data.push(obj);
        }  
    }

    if(properties.instrument.item.type=='isi_tempat_kosong'){
        for(var y in answer){
            var a = answer[y];
            var obj = {};
            obj.dbId = a.id;
            obj.content = '';
            obj.assign = a.assign;
            obj.descriptionList = [];
            if(a.file!=null){
                obj.content += '<div><img src="'+a.file+'"></div>';
            }
            if(a.answer_option!=null){
                obj.content += a.answer_option;
            }
            if(a.content!=null){
                obj.content += a.content;
            }
            var obj2 = {};
            obj2.content = '';
            for(var y in a.descriptionList){
                var d = a.descriptionList[y];
                if(d.file!=null){
                    obj2.content += '<div><img src="'+d.file+'"></div>';
                }
                if(d.text!=null){
                    obj2.content += d.text;
                }
                if(d.content!=null){
                    obj.descriptionList = a.descriptionList;
                }else{
                    obj.descriptionList.push(obj2);
                }
            } 
            for(var y in a.answerList){
                var d = a.answerList[y];
                if(d.content!=null){
                    obj.answerList = a.answerList;
                }
            } 
            item.answer.data.push(obj);
        }  
    }

    if(properties.instrument.item.type=='benar_palsu' || properties.instrument.item.type=='susun_semula' || properties.instrument.item.type=='pengelasan'){
        for(var y in answer){
            var a = answer[y];
            var obj = {};
            obj.dbId = a.id;
            obj.content = '';
            obj.assign = a.assign;
            obj.descriptionList = [];
            if(a.file!=null){
                obj.content += '<div><img src="'+a.file+'"></div>';
            }
            if(a.answer_option!=null){
                obj.content += a.answer_option;
            }
            if(a.content!=null){
                obj.content += a.content;
            }
            var obj2 = {};
            obj2.content = '';
            for(var y in a.descriptionList){
                var d = a.descriptionList[y];
                if(d.file!=null){
                    obj2.content += '<div><img src="'+d.file+'"></div>';
                }
                if(d.text!=null){
                    obj2.content += d.text;
                }
                if(d.content!=null){
                    obj.descriptionList = a.descriptionList;
                }else{
                    obj.descriptionList.push(obj2);
                }
            } 
            item.answer.data.push(obj);
        }  
    }

    if(properties.instrument.item.type=='padanan'){
        for(var y in answer){
            var a = answer[y];
            var obj = {};
            obj.dbId = a.id;
            obj.content = '';
            obj.assign = a.assign;
            obj.descriptionList = [];
            if(a.file!=null){
                obj.content += '<div><img src="'+a.file+'"></div>';
            }
            if(a.answer_option!=null){
                obj.content += a.answer_option;
            }
            if(a.content!=null){
                obj.content = a.content;
            }
            var obj2 = {};
            obj2.content = '';
            for(var y in a.descriptionList){
                var d = a.descriptionList[y];
                if(d.file!=null){
                    obj2.content += '<div><img src="'+d.file+'"></div>';
                }
                if(d.text!=null){
                    obj2.content += d.text;
                }
                if(d.content!=null){
                    obj.descriptionList = a.descriptionList;
                }else{
                    obj.descriptionList.push(obj2);
                }
            } 
            item.answer.data.push(obj);
        }  
    }

    if(properties.instrument.item.type=='subjective'){
        var a = scheme;
        var obj = {};
        obj.dbId = a.id;
        obj.content = '';
        obj.assign = false;
        obj.descriptionList = [];
        if(a.file!=null){
            obj.content += '<div><img src="'+a.file+'"></div>';
        }
        if(a.text!=null){
            obj.content += a.text;
        }
        if(a.content!=null){
            obj.content += a.content;
        }
        var obj2 = {};
        obj2.content = '';
        for(var y in a.descriptionList){
            var d = a.descriptionList[y];
            if(d.file!=null){
                obj2.content += '<div><img src="'+d.file+'"></div>';
            }
            if(d.text!=null){
                obj2.content += d.text;
            }
            if(d.content!=null){
                obj.descriptionList = a.descriptionList;
            }else{
                obj.descriptionList.push(obj2);
            }
        } 
        item.scheme.data.push(obj);
    }
    
    var obj = {};
    obj.dbId = hint.id;
    obj.content = '';
    if(hint.file!=null){
        obj.content += '<div><img src="'+hint.file+'"></div>';
    }
    if(hint.text!=null){
        obj.content += hint.text;
    }
    if(hint!=null){
        item.hint.data = hint;
    }else{
        item.hint.data.push(obj);
    }
    item.type = properties.instrument.item.type;
    return item;
}

function contentAnalys(content){
    var status = true;
    var data = content;
    if(data==null || data==undefined || data==''){
        status = false;
    }else{
        if(data.indexOf('img')>0){
            status = true;
        }else{
            data = data.replace(/[^a-z0-9\s]/gi, '');
            data = data.replace(/<\/?(?!img)\w*\b[^>]*>/ig, '');
        }  
    }
    if(status==true){
        if(data.trim()==''){
            status = false;
        }
    }
    return status;
}

function setSorting(type, obj){
    if(type=='view-reorder'){
        var count = 0;
        for(var x in obj){
            Sortable.create($(".row-reorder.reorder .tpl-sortable" )[count], {
                animation: 150,
                onEnd: function (/**Event*/evt) {
                //updateAnsReorder($(evt.target));
                }
            });
            count++;
        }
        $('.row-reorder.reorder .tpl-sortable').each(function(){
            var thiS = $(this);
            var id = thiS.data('id');
            for(var x in obj){
                var answerKey = [];
                if(obj[x].dbId==id){
                    thiS.find('li.group').each(function(){
                      answerKey.push($(this).data('id'));
                    });
                    obj[x].answerKey = answerKey;
                    break;
                }
            }
            thiS.randomize('li.group');
        });
        console.log('test');
        console.log(obj);
        //$( ".row-reorder.reorder .tpl-sortable")[count]
    }
}


$.fn.randomize = function(childElem) {
    return this.each(function() {
        var $this = $(this);
        var elems = $this.children(childElem);
  
        elems.sort(function() { return (Math.round(Math.random())-0.5); });  
  
        $this.remove(childElem);  
  
        for(var i=0; i < elems.length; i++)
          $this.append(elems[i]);      
  
    });    
}
