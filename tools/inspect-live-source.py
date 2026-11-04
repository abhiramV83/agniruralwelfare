from html.parser import HTMLParser
from pathlib import Path
import json, re

class Node:
    def __init__(self, tag='', attrs=(), parent=None):
        self.tag, self.attrs, self.parent, self.children = tag, dict(attrs), parent, []
    def text(self):
        def raw(node):
            return ''.join(c if isinstance(c,str) else (' ' if c.tag=='br' else raw(c)) for c in node.children)
        return re.sub(r'\s+', ' ', raw(self)).strip()
    def walk(self):
        yield self
        for c in self.children:
            if isinstance(c,Node): yield from c.walk()
class Parser(HTMLParser):
    def __init__(self):
        super().__init__(); self.root=Node('root'); self.current=self.root
    def handle_starttag(self,tag,attrs):
        node=Node(tag,attrs,self.current); self.current.children.append(node)
        if tag not in {'area','base','br','col','embed','hr','img','input','link','meta','param','source','track','wbr'}: self.current=node
    def handle_endtag(self,tag):
        node=self.current
        while node.parent:
            if node.tag==tag: self.current=node.parent;return
            node=node.parent
    def handle_data(self,data): self.current.children.append(data)
p=Parser();p.feed(Path('reference/live-original.html').read_text(encoding='utf-8'))
nodes=list(p.root.walk()); ids={n.attrs['id']:n for n in nodes if n.attrs.get('id')}
labels={n.attrs.get('for'):n.text() for n in nodes if n.tag=='label' and n.attrs.get('for')}
def field(n):
    siblings=[c for c in n.parent.children if isinstance(c,Node)]
    preceding=siblings[:siblings.index(n)]
    label=labels.get(n.attrs.get('id')) or next((x.text() for x in reversed(preceding) if x.tag=='label'),None)
    if n.parent.tag=='label':label=n.parent.text()
    return {'tag':n.tag,**n.attrs,'label':label,'options':[{'label':o.text(),'value':o.attrs.get('value',o.text())} for o in n.walk() if o.tag=='option']}
sections={}
for key,node in ids.items():
    if node.tag in ('section','form') or key in ('cadetStep1','cadetStep2','registrationSuccessModal','userIdCardSection','identityCardTemplate'):
        sections[key]={'tag':node.tag,'text':node.text(),'blocks':[{'tag':n.tag,'text':n.text(),'id':n.attrs.get('id')} for n in node.walk() if n.tag in ('h1','h2','h3','p','li','button')], 'fields':[field(n) for n in node.walk() if n.tag in ('input','select','textarea')]}
script=Path('reference/live-script.js').read_text(encoding='utf-8')
gallery=re.findall(r'"([^"]+)"',re.search(r'const galleryImages\s*=\s*\[([^\]]+)\]',script).group(1))
images=list(dict.fromkeys([n.attrs['src'] for n in nodes if n.tag=='img' and n.attrs.get('src')]+gallery))
css=Path('reference/live-style.css').read_text(encoding='utf-8')
images=list(dict.fromkeys(images+re.findall(r'url\(["\']?([^"\')]+\.(?:png|jpg|jpeg|webp))["\']?\)',css)))
nav=[a.text() for n in nodes if n.tag=='nav' for a in n.walk() if a.tag=='a']
result={'source':'https://agniruralwelfaresociety.org.in/','sections':sections,'gallery':gallery,'images':images,'nav':nav}
Path('reference/live-structure.json').write_text(json.dumps(result,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
Path('reference/live-text.txt').write_text('\n\n'.join('['+key+']\n'+'\n'.join(b['tag']+': '+b['text'] for b in section['blocks']) for key,section in sections.items()),encoding='utf-8')
print(json.dumps({'sections':list(sections),'images':len(images),'gallery':len(gallery),'nav':nav},ensure_ascii=False))
