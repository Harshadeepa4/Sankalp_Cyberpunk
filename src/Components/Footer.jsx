import { FaGithub, FaInstagram, FaLinkedin, FaTwitter } from 'react-icons/fa';
import { resourcesLinks, platformLinks } from '../constants';
const Footer = () => {
  const teamMembers = [{ github: "#", instagram: "#", linkedin: "#", twitter: "#" }];

  const filteredPlatformLinks = platformLinks.filter(
    (link) => link && link.text && link.text !== "Solutions" && link.text !== "Release Notes"
  );

  return (
    <footer className="mt-20 border-t py-10 border-neutral-700">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Team Information */}
        <div className="flex flex-col items-left">
          <h3 className="text-md font-semibold mb-2">Team</h3>
          <h2 className="text-2xl font-bold mb-2" style={{ textAlign: 'left', padding: '1px' }}>CyberPunks</h2>
          <div className="flex space-x-6 text-3xl">
            {teamMembers.map((member, index) => (
              <div key={index} className="flex space-x-2">
                {member.github && (
                  <a href={member.github} className="text-neutral-300 hover:text-white">
                    <FaGithub />
                  </a>
                )}
                {member.instagram && (
                  <a href={member.instagram} className="text-neutral-300 hover:text-white">
                    <FaInstagram />
                  </a>
                )}
                {member.linkedin && (
                  <a href={member.linkedin} className="text-neutral-300 hover:text-white">
                    <FaLinkedin />
                  </a>
                )}
                {member.twitter && (
                  <a href={member.twitter} className="text-neutral-300 hover:text-white">
                    <FaTwitter />
                  </a>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Resources */}
        <div>
          <h3 className="text-md font-semibold mb-4">Resources</h3>
          <ul className="space-y-2">
            {resourcesLinks.map((link, index) => {
              if (link && link.text !== "Community Forums" && link.text !== "Tutorials") {
                return (
                  <li key={index}>
                    <a
                      href={link.href}
                      className="text-neutral-300 hover:text-white"
                    >
                      {link.text}
                    </a>
                  </li>
                );
              }
              return null;
            })}
          </ul>
        </div>

        {/* Platform */}
        <div>
          <h3 className="text-md font-semibold mb-4">Platform</h3>
          <ul className="space-y-2">
            {filteredPlatformLinks.map((link, index) => (
              <li key={index}>
                <a
                  href={link.href}
                  className="text-neutral-300 hover:text-white"
                >
                  {link.text}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </footer>
  );
};

export default Footer;