export const metadata = { title: 'Terms of Service' };

const TermsOfService = () => {
    return (
        <main className="min-h-screen bg-slate-950 text-slate-200 pt-32 pb-20 px-4 md:px-8">
            <div className="max-w-4xl mx-auto space-y-12">
                <div className="text-center space-y-4">
                    <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight">
                        Terms of <span className="text-primary">Service</span>
                    </h1>
                    <p className="text-slate-400">Last Updated: {new Date().toLocaleDateString()}</p>
                </div>

                <div className="space-y-8 bg-slate-900/50 p-8 rounded-3xl border border-white/5 backdrop-blur-sm">
                    <section className="space-y-4">
                        <h2 className="text-2xl font-bold text-white">1. Agreement to Terms</h2>
                        <p className="leading-relaxed">
                            These Terms of Service constitute a legally binding agreement made between you, whether personally or on behalf of an entity (“you”) and Nisadya (“we,” “us” or “our”), concerning your access to and use of our website.
                        </p>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-2xl font-bold text-white">2. User Registration</h2>
                        <p className="leading-relaxed">
                            You may be required to register with the Site to access certain features (e.g., event registration). You agree to keep your password confidential and will be responsible for all use of your account and password.
                        </p>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-2xl font-bold text-white">3. Code of Conduct</h2>
                        <p className="leading-relaxed">
                            By participating in our events, you agree to behave in a respectful manner towards all participants, organizers, and staff. Harassment, discrimination, or disruptive behavior will not be tolerated and may result in expulsion from the event without refund.
                        </p>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-2xl font-bold text-white">4. Intellectual Property Rights</h2>
                        <p className="leading-relaxed">
                            Unless otherwise indicated, the Site is our proprietary property and all source code, databases, functionality, software, website designs, audio, video, text, photographs, and graphics on the Site (collectively, the “Content”) and the trademarks, service marks, and logos contained therein (the “Marks”) are owned or controlled by us or licensed to us.
                        </p>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-2xl font-bold text-white">5. Modifications</h2>
                        <p className="leading-relaxed">
                            We reserve the right to change, modify, or remove the contents of the Site at any time or for any reason at our sole discretion without notice. However, we have no obligation to update any information on our Site.
                        </p>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-2xl font-bold text-white">6. Contact Us</h2>
                        <p className="leading-relaxed">
                            To resolve a complaint regarding the Site or to receive further information regarding use of the Site, please contact us at: <a href="mailto:nisadya@nitt.edu" className="text-primary hover:underline">nisadya@nitt.edu</a>.
                        </p>
                    </section>
                </div>
            </div>
        </main>
    );
};

export default TermsOfService;
