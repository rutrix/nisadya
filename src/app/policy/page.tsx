export const metadata = { title: 'Privacy Policy' };

const PrivacyPolicy = () => {
    return (
        <main className="min-h-screen bg-slate-950 text-slate-200 pt-32 pb-20 px-4 md:px-8">
            <div className="max-w-4xl mx-auto space-y-12">
                <div className="text-center space-y-4">
                    <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight">
                        Privacy <span className="text-primary">Policy</span>
                    </h1>
                    <p className="text-slate-400">Last Updated: {new Date().toLocaleDateString()}</p>
                </div>

                <div className="space-y-8 bg-slate-900/50 p-8 rounded-3xl border border-white/5 backdrop-blur-sm">
                    <section className="space-y-4">
                        <h2 className="text-2xl font-bold text-white">1. Introduction</h2>
                        <p className="leading-relaxed">
                            Welcome to Nisadya. We are committed to protecting your personal information and your right to privacy. If you have any questions or concerns about our policy, or our practices with regards to your personal information, please contact us.
                        </p>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-2xl font-bold text-white">2. Information We Collect</h2>
                        <p className="leading-relaxed">
                            We collect personal information that you voluntarily provide to us when registering at the event website, expressing an interest in obtaining information about us or our products and services, when participating in activities on the website or otherwise contacting us.
                        </p>
                        <ul className="list-disc pl-5 space-y-2 text-slate-400">
                            <li>Name and Contact Data (Email, Phone Number)</li>
                            <li>Credentials (Student ID, College Name)</li>
                            <li>Event Registration Details</li>
                        </ul>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-2xl font-bold text-white">3. How We Use Your Information</h2>
                        <p className="leading-relaxed">
                            We use the information we collect or receive:
                        </p>
                        <ul className="list-disc pl-5 space-y-2 text-slate-400">
                            <li>To facilitate account creation and logon process.</li>
                            <li>To send you administrative information.</li>
                            <li>To fulfill and manage your event registrations.</li>
                            <li>To request feedback.</li>
                        </ul>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-2xl font-bold text-white">4. Sharing Your Information</h2>
                        <p className="leading-relaxed">
                            We only share information with your consent, to comply with laws, to provide you with services, to protect your rights, or to fulfill business obligations. We do not sell your personal information to third parties.
                        </p>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-2xl font-bold text-white">5. Contact Us</h2>
                        <p className="leading-relaxed">
                            If you have questions or comments about this policy, you may email us at <a href="mailto:nisadya@nitt.edu" className="text-primary hover:underline">nisadya@nitt.edu</a>.
                        </p>
                    </section>
                </div>
            </div>
        </main>
    );
};

export default PrivacyPolicy;
