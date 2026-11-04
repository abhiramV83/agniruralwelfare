"""Update observed reference content without replacing the existing application."""
import json
from pathlib import Path
p=Path('client/src/content/site.json')
c=json.loads(p.read_text(encoding='utf-8'))
s=json.loads(Path('reference/live-structure.json').read_text(encoding='utf-8'))
c['nav'][3]['label']='Gallery/Activites'
c['brand']['motto']='Motto : Bravery Unity & Discipline'
c['home']['more']='Click here for more information'
c['home']['images']=['/assets/original/'+x for x in ['image51.jpg','image3.jpg','image20.jpg','image57.jpg','image58.jpg','image59.jpg','image61.jpg','image62.jpg','image64.jpg','image4.jpg','image52.jpg']]
for fields in [c['forms']['register']]:
    if not any(f['name']=='bloodGroup' for f in fields):
        fields.insert(next(i for i,f in enumerate(fields) if f['name']=='dob'),dict(name='bloodGroup',label='BLOOD GROUP',placeholder='e.g. O+, A-, B+',required=True,visibleRequired=False))
    for f in fields:
        if f['name'] in ['guardian','address','dob','photo']: f['required']=True
        if f['name']=='enrollmentDate': f['readOnly']=True
        if f['name'] not in ['enrollmentDate']: f['required']=True
        f['visibleRequired']=False
for f in c['forms']['login']: f['required']=True;f['visibleRequired']=False
for f in c['forms']['pledge']: f['required']=True;f['visibleRequired']=False
for f in c['forms']['internship']:
    f['required']=f['name']!='jobPortal'
    f['wide']=f['name'] in ['address','cv','motivation','consent']
c['gallery']['referenceTotal']=47
for item,amount in zip(c['donate']['impacts'],[100,500,1000,5000]): item['amount']=amount
mapping={'cadetName':'fullName','cadetPhoto':'photo','cadetGenderSelect':'gender','fatherName':'fatherName','fatherOcc':'fatherOccupation','motherName':'motherName','motherOcc':'motherOccupation','guardianName':'guardian','cadetAddress':'address','citizenship':'citizenship','village':'village','tehsil':'tehsil','district':'district','pincode':'pincode','postOffice':'postOffice','railwayStation':'railwayStation','education':'qualification','dob':'dob','school':'school','training':'training','resAddress':'residentialAddress','contactNo':'phone','cadetEmail':'email'}
fields=[]
for page in [1,2]:
    for f in s['sections']['cadetStep'+str(page)]['fields']:
        if f['id'] not in mapping: continue # Explicitly omit income, Aadhaar and PAN.
        field=dict(name=mapping[f['id']],label=f['label'].removesuffix(' *'),type=f['tag'] if f['tag']!='input' else f.get('type','text'),required=f['label'].endswith(' *'),page=page)
        if f.get('placeholder'): field['placeholder']=f['placeholder']
        if field['type']=='select':
            field['placeholder']=f['options'][0]['label'];field['options']=[o['value'] for o in f['options'][1:]]
        if field['type']=='file': field['accept']='image/png,image/jpeg'
        if field['name'] in ['fullName','photo']: field['group']='identity'
        if field['name'] in ['residentialAddress','phone','email']: field['wide']=True
        fields.append(field)
c['demo']['enrollmentFields']=fields
c['demo']['enrollIntro']='Use fake sample data only. Aadhaar, PAN and annual income fields are omitted for this demo.'
c['demo']['unobserved']=''
c['demo']['enrollmentHeadings']=['ARWS Cadet Enrollment – Page 1','ARWS Cadet Enrollment – Page 2']
c['demo']['cadetSuccess']='🎉 Registration Successful!'
c['demo']['cadetSubmitted']='Your ARWS Cadet Enrollment has been submitted successfully!'
c['demo']['copyId']='Copy ID'
c['demo']['cadetRegistrationId']='Your Registration ID:'
c['demo']['copied']='ID copied'
c['demo']['cadetDownload']='Download Identity Card'
c['demo']['cadetEmailNotice']='Demo: no email is sent. Copy your Registration ID and download your Identity Card here.'
c['demo']['profile']='Your ARWS Identity Card'
c['demo']['idHeading']='IDENTITY CARD'
c['demo']['download']='Download ID Card'
c['demo']['galleryNote']=''
c['demo']['cvHelp']='PDF, DOC, DOCX, JPG or PNG. Maximum 2 MB.'
c['demo']['idFields']=[{'name':name,'label':label} for name,label in [('fullName','Full Name :'),('username','Username :'),('email','Email :'),('guardian',"Father's / Guardian :"),('address','Permanent Address :'),('bloodGroup','Blood Group :'),('dob','Date of Birth :'),('enrollmentDate','Date of Enrollment :')]]
for f in c['forms']['internship']:
    f.pop('optionsSource',None)
    if f['name']=='gender': f['options']=['Male','Female']
    if f['name']=='position': f['options']=[{'label':'Volunteer Trainer (NCC ‘C’ Certificate Internship)','value':'Volunteer Trainer (NCC C Certificate Internship)'},'NGO Fundraising & Field Coordinator Internship']
    if f['name']=='cv': f['accept']='.pdf,.doc,.docx,.jpg,.jpeg,.png'
c['donate'].update(membershipHeading='Membership Contribution',membershipIntro='Become a supporting member of Agni Rural Welfare Society.',membershipOptions=['Monthly Membership','Yearly Membership'])
c['gallery']['images']=[dict(src='/assets/original/'+x,alt='Agni Rural Welfare Society social activity '+str(i+1),referenceIndex=i+1) for i,x in enumerate(s['gallery'])]
c['supporters']['links']=[dict(src='/assets/original/'+file,alt=alt,href=url) for file,alt,url in [('connectfor.png','ConnectFor','https://www.connectfor.org/'),('intershala.png','Internshala','https://internshala.com/'),('nyks.png','Nehru Yuva Kendra Sangathan','https://nyks.nic.in/')]]
def fix(v):
    if isinstance(v,str): return v.replace('Winter clothing distribution. Anesthesia.','Winter clothing distribution Anesthesia.').replace('Terms & Conditions Apply.', 'Terms & Conditions Apply.')
    if isinstance(v,list):return [fix(x) for x in v]
    if isinstance(v,dict):return {k:fix(x) for k,x in v.items()}
    return v
c=fix(c)
c['membership']['terms']='Terms & Conditions Apply.'
c['sourceEvidence']={'url':s['source'],'forms':s['sections'],'note':'Reference transcript only. Original email/payment claims are replaced with explicit demo notices in the application.'}
p.write_text(json.dumps(c,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
print('Reconciled source fields, options, images, navigation and identity-card text.')
