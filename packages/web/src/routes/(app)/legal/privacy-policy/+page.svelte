<script lang="ts">
	import Seo from '$lib/components/Seo.svelte';
	import ContactCard from '$lib/components/ContactCard.svelte';
</script>

<Seo
	title="Privacy Policy - ChowBenin"
	description="Learn how ChowBenin collects, uses, and protects your personal information."
/>

<div class="prose prose-sm max-w-none">
	<h1 class="text-2xl font-extrabold">Privacy Policy</h1>
	<p class="text-text-muted text-sm">Last updated: December 2, 2025</p>

	<section class="mt-8 space-y-6">
		<div>
			<h2 class="text-lg font-bold">1. Introduction</h2>
			<p class="text-text-body mt-2 text-sm leading-relaxed">
				Welcome to ChowBenin. This Privacy Policy explains how Mafflle Technology Enterprise
				("we," "us," or "our") collects, uses, discloses, and safeguards your information when you
				use our food delivery platform and services in Benin Republic.
			</p>
			<p class="text-text-body mt-2 text-sm leading-relaxed">
				By using ChowBenin, you agree to the collection and use of information in accordance with
				this policy. If you do not agree with our policies, please do not use our services.
			</p>
		</div>

		<div>
			<h2 class="text-lg font-bold">2. Information We Collect</h2>
			<p class="text-text-body mt-2 text-sm leading-relaxed">
				We collect information that you provide directly to us when using our services:
			</p>
			<ul class="text-text-body mt-2 list-disc space-y-1 pl-5 text-sm">
				<li><strong>Account Information:</strong> Full name, email address, and phone number</li>
				<li>
					<strong>Delivery Information:</strong> Delivery addresses and location data for order fulfillment
				</li>
				<li>
					<strong>Order History:</strong> Records of your past orders and restaurant preferences
				</li>
				<li><strong>Favorites:</strong> Restaurants you've saved to your favorites list</li>
				<li>
					<strong>Payment Information:</strong> Payment details are processed securely through Paystack
					and are not stored on our servers
				</li>
			</ul>
		</div>

		<div>
			<h2 class="text-lg font-bold">3. How We Use Your Information</h2>
			<p class="text-text-body mt-2 text-sm leading-relaxed">We use the information we collect to:</p>
			<ul class="text-text-body mt-2 list-disc space-y-1 pl-5 text-sm">
				<li>Process and deliver your food orders</li>
				<li>Create and manage your account</li>
				<li>Communicate with you about orders, updates, and promotions</li>
				<li>Improve our services and user experience</li>
				<li>Analyze usage patterns through Google Analytics</li>
				<li>Prevent fraud and ensure platform security</li>
				<li>Comply with legal obligations</li>
			</ul>
		</div>

		<div>
			<h2 class="text-lg font-bold">4. Information Sharing</h2>
			<p class="text-text-body mt-2 text-sm leading-relaxed">
				We do not sell your personal information. We share your information only with:
			</p>
			<ul class="text-text-body mt-2 list-disc space-y-1 pl-5 text-sm">
				<li>
					<strong>Restaurant Partners:</strong> To fulfill your orders (name, delivery address, order
					details)
				</li>
				<li>
					<strong>Delivery Personnel:</strong> To complete deliveries (name, phone number, delivery address)
				</li>
				<li>
					<strong>Paystack:</strong> Our payment processor, for secure payment processing
				</li>
				<li>
					<strong>Google Analytics:</strong> For anonymized usage analytics to improve our services
				</li>
			</ul>
		</div>

		<div>
			<h2 class="text-lg font-bold">5. Data Security</h2>
			<p class="text-text-body mt-2 text-sm leading-relaxed">
				We implement appropriate technical and organizational security measures to protect your
				personal information. However, no method of transmission over the Internet or electronic
				storage is 100% secure. While we strive to protect your data, we cannot guarantee absolute
				security.
			</p>
		</div>

		<div>
			<h2 class="text-lg font-bold">6. Data Retention</h2>
			<p class="text-text-body mt-2 text-sm leading-relaxed">
				We retain your personal information for as long as your account is active or as needed to
				provide you services. We may retain certain information as required by law or for
				legitimate business purposes such as resolving disputes and enforcing our agreements.
			</p>
		</div>

		<div>
			<h2 class="text-lg font-bold">7. Your Rights</h2>
			<p class="text-text-body mt-2 text-sm leading-relaxed">You have the right to:</p>
			<ul class="text-text-body mt-2 list-disc space-y-1 pl-5 text-sm">
				<li>Access the personal information we hold about you</li>
				<li>Request correction of inaccurate information</li>
				<li>Request deletion of your account and associated data</li>
				<li>Opt out of promotional communications</li>
			</ul>
			<p class="text-text-body mt-2 text-sm leading-relaxed">
				To exercise these rights, please contact us at
				<a href="mailto:oluwaseyifunmi@mafflle.com" class="text-primary underline"
					>oluwaseyifunmi@mafflle.com</a
				>.
			</p>
		</div>

		<div>
			<h2 class="text-lg font-bold">8. Children's Privacy</h2>
			<p class="text-text-body mt-2 text-sm leading-relaxed">
				ChowBenin is not intended for children under 13 years of age. We do not knowingly collect
				personal information from children under 13. If you are a parent or guardian and believe
				your child has provided us with personal information, please contact us immediately.
			</p>
		</div>

		<div>
			<h2 class="text-lg font-bold">9. Changes to This Policy</h2>
			<p class="text-text-body mt-2 text-sm leading-relaxed">
				We may update this Privacy Policy from time to time. We will notify you of any changes by
				posting the new policy on this page and updating the "Last updated" date. Continued use of
				our services after changes constitutes acceptance of the updated policy.
			</p>
		</div>

		<ContactCard title="10. Contact Us" />
	</section>
</div>
