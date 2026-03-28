const Education = () => {
  const educationItems = [{
    degree: 'Master of Economics',
    institution: 'University of Rijeka',
    period: '1998 - 2007',
    description: 'Broad economics curriculum covering Human Resource Management, Accounting, Information Technology, and Marketing. Developed strong analytical and organisational foundations that bridge business strategy with technology-driven solutions.'
  }];
  const certifications = ['MCSD: Web Applications', 'MCSA: Web Applications'];
  return <section id="education" className="section-padding bg-black text-white">
      <div className="container mx-auto">
        <h2 className="text-4xl md:text-5xl font-light mb-12 text-center">
          Education & Certifications
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          <div>
            <h3 className="text-2xl font-medium mb-8 border-b border-white pb-2">
              Academic Background
            </h3>
            <div className="space-y-8">
              {educationItems.map((item, index) => <div key={index} className="mb-6">
                  <h4 className="text-xl font-medium">{item.degree}</h4>
                  <p className="text-lg font-light">{item.institution}</p>
                  <p className="text-md font-light text-gray-400 mb-2">
                    {item.period}
                  </p>
                  <p className="font-light">{item.description}</p>
                </div>)}
            </div>
          </div>
          <div>
            <h3 className="text-2xl font-medium mb-8 border-b border-white pb-2">
              Professional Certifications
            </h3>
            <ul className="space-y-4">
              {certifications.map((cert, index) => <li key={index} className="flex items-center">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                  <span className="text-lg font-light">{cert}</span>
                </li>)}
            </ul>
            <h3 className="text-2xl font-medium mt-12 mb-6 border-b border-white pb-2">
              Languages
            </h3>
            <div className="space-y-4">
              <div>
                <p className="text-lg font-light mb-2">English</p>
                <div className="flex space-x-1">
                  {[...Array(5)].map((_, i) => <div key={i} className="w-8 h-2 bg-white"></div>)}
                </div>
              </div>
              <div>
                <p className="text-lg font-light mb-2">German</p>
                <div className="flex space-x-1">
                  {[...Array(5)].map((_, i) => <div key={i} className={`w-8 h-2 ${i < 3 ? 'bg-white' : 'bg-gray-700'}`}></div>)}
                </div>
              </div>
              <div>
                <p className="text-lg font-light mb-2">Italian</p>
                <div className="flex space-x-1">
                  {[...Array(5)].map((_, i) => <div key={i} className={`w-8 h-2 ${i < 4 ? 'bg-white' : 'bg-gray-700'}`}></div>)}
                </div>
              </div>
              <div>
                <p className="text-lg font-light mb-2">Croatian</p>
                <div className="flex space-x-1">
                  {[...Array(5)].map((_, i) => <div key={i} className={`w-8 h-2 ${i < 5 ? 'bg-white' : 'bg-gray-700'}`}></div>)}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>;
};
export default Education;