import Image from 'next/image';
import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'MoSJE - NAPDDR Scheme',
  description: 'Information about the District De-Addiction Centre (DDAC) sanctioned by the Ministry of Social Justice and Empowerment (MoSJE) under the NAPDDR scheme.',
};

export default function MosjePage() {
  return (
    <div className="bg-white py-12">
      <div className="container mx-auto max-w-4xl">
        <div className="rounded-lg border border-gray-300 bg-white p-8 px-4 text-gray-800 shadow-lg md:p-12 md:px-10">
          <div className="flex flex-col items-center text-center">
            <Image
              src="https://upload.wikimedia.org/wikipedia/commons/5/55/Emblem_of_India.svg"
              alt="Emblem of India"
              width={60}
              height={90}
              className="mb-4"
            />
            <h1 className="text-xl font-bold text-blue-700 md:text-2xl">
              Ministry of Social Justice and Empowerment (MoSJE)
            </h1>
            <h2 className="text-lg font-bold text-green-700 md:text-xl">
              National Action Plan for Drug Demand Reduction (NAPDDR)
            </h2>
          </div>

          <div className="mt-8 space-y-6 text-justify">
            <p>
              We are glad to announce that our centre viz. <strong className="font-semibold text-green-700">CONCERN</strong> has been
              approved and sanctioned by MoSJE for the above scheme to launch
            </p>
            <div className="my-6 text-center">
              <p className="text-xl font-bold text-red-600">
                District De-Addiction Centre (DDAC)
              </p>
              <p className="text-lg font-bold text-red-600">
                From 1<sup>st</sup> of January 2024.
              </p>
            </div>
            <p>
              DDAC comprises of Integrated Rehabilitation Centre for Addicts (IRCA), Out-Reach Drop-in
              Centre (ODIC) and Community based Peer Led Intervention (CPLI). <strong className="font-bold text-red-600">All the three facilities are free of cost.</strong>
            </p>

            <div className="space-y-4 pt-4">
              <h3 className="text-lg font-bold text-blue-700">
                Integrated Rehabilitation Centre for Addicts (IRCA)
              </h3>
              <p>
                In-Patient free treatment and rehabilitation with staying and food facility. Whole
                person recovery is the main purpose of this facility. The treatment and rehabilitation
                includes individual counselling, group therapy, medical assistance, recreation, art
                therapy, In-house meetings and all related support.
              </p>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-bold text-blue-700">Out-Reach Drop-in Centre (ODIC)</h3>
              <p>
                The substance abusers can make use of this free facility by availing the day care
                assistance viz. medical assessment, counselling, first aid, motivation counselling for
                IRCA, recreation and relaxation.
              </p>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-bold text-blue-700">
                Community based Peer Led Intervention (CPLI)
              </h3>
              <p>
               Our centre CONCERN will reach out to the community by visiting them. Conduct various awareness programmes to educate the ill effects of substance abuse. Motivate them to form peer groups and lead them to ODCI and IRCA. The main purpose of this scheme is to concentrate on children, Teens and youths for early prevention of substance abuse. Catch them Young is the theme.
              </p>
            </div>

            <p className="pt-6 font-semibold text-red-600">
              Avail these facilities to prevent and treat substance abusers. Guide and show the way to
              your known people who are affected by addiction.
            </p>
          </div>
        </div>
        <div className="mt-10 text-center">
          <p className="text-xl font-bold text-primary">
            Kindly visit <Link href="/gallery/ministry-of-social-justice-and-empowerment" className="underline text-accent-foreground hover:text-accent transition-colors">Gallery</Link> for more activities of MoSJE.
          </p>
        </div>
      </div>
    </div>
  );
}
